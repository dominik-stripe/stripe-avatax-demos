import Stripe from "stripe";
import Boom from "@hapi/boom";
import { postOnly, respondWithError } from "@/lib/api";
import { z } from "zod";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";

// Setup Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});
const metaKey = "avatax-tax-rate-id";

// Avatax
const user = process.env.AVATAX_USERNAME!;
const pass = process.env.AVATAX_PASSWORD!;
const creds = Buffer.from(`${user}:${pass}`).toString("base64");
const avatax = axios.create({
  baseURL: "https://sandbox-rest.avatax.com/api/v2/",
  headers: {
    Authorization: `Basic ${creds}`,
  },
});

// Req / Res
const CalculateTaxesRequestSchema = z.object({
  companyCode: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
    line1: z.string(),
    postalCode: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }),
  lineItems: z.array(
    z.object({
      price: z.string(),
      quantity: z.number().min(1),
      taxIncluded: z.boolean().optional(),
      taxCode: z.string().optional(),
    })
  ),
});

export type CalculateTaxesRequest = z.infer<typeof CalculateTaxesRequestSchema>;

export type CalculateTaxesResponseLineItemsOut = {
  price: string;
  quantity: number;
  taxRates: string[];
};

export type CalculateTaxesResponse = {
  stripeTaxRatesCreated: string[];
  lineItems: CalculateTaxesResponseLineItemsOut[];
  createTransactionResponse?: AvaTaxApi.CreateTransactionResponse;
};

export interface CalculateTaxesErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

// Helpers
const findOrCreateStripeTaxRate = async (
  detail: AvaTaxApi.TaxDetail,
  taxIncluded: boolean
) => {
  const avaTaxRateId = `${detail.jurisCode}-${detail.taxType}-${
    detail.rateType
  }-${detail.rate}-${taxIncluded ? "Included" : "Excluded"}`;
  const taxRates = await stripe.taxRates.list({ active: true });
  const taxRate = taxRates.data.find(
    ({ metadata }) => metadata && metadata[metaKey] === avaTaxRateId
  );

  if (taxRate) {
    return { avaTaxRateId, taxRate, newlyCreated: false };
  }

  const newlyCreatedTaxRate = await stripe.taxRates.create({
    display_name: detail.taxName,
    inclusive: taxIncluded,
    percentage: detail.rate * 100,
    country: detail.country,
    jurisdiction: detail.jurisCode,
    metadata: {
      [metaKey]: avaTaxRateId,
    },
  });

  return { avaTaxRateId, taxRate: newlyCreatedTaxRate, newlyCreated: false };
};

// Handler
export default postOnly(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CalculateTaxesResponse | CalculateTaxesErrorResponse>
) {
  const stripeTaxRatesCreated: string[] = [];
  let body: CalculateTaxesRequest;

  // Parse request
  try {
    body = CalculateTaxesRequestSchema.parse(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues[0];
      const msg = `${firstIssue.path.join(".")}: ${firstIssue.message}`;
      respondWithError(res, Boom.badRequest(msg));
    } else {
      respondWithError(res, Boom.internal());
    }
    return;
  }
  logger.debug(body, "Got CalculateTaxesRequest");

  // Fetch price information for line items
  let currency: string | undefined;
  const avaTaxlineItems: AvaTaxApi.LineInput[] = [];

  logger.debug("Fechting Stripe Price data");
  // Build AvaTax line items
  // NOT OPTIMIZED; MOSTLY HAPPY PATH
  try {
    for (const lineItem of body.lineItems) {
      const price = await stripe.prices.retrieve(lineItem.price);

      // Set currency based on price information.
      if (!currency) {
        currency = price.currency;
        logger.debug(`Set currency to "${currency}"`);
      }

      const avaTaxlineItem: AvaTaxApi.LineInput = {
        ref1: price.id,
        quantity: lineItem.quantity,
        /**
         * This is the total price of goods or services for this line item.
         * This is the total, fully extended value. For example, if you specify a quantity of 2 and an amount of 10, this means that you have sold two $5 items for a total price of $10.
         * */
        amount: (price.unit_amount! / 100) * lineItem.quantity,
        /**
         * SW054000
         * Description: Cloud services - saas - service agreement
         * Details: An entity that retains custody over (or "hosts") software for use by its customer. Users of the software hosted by an ASP typically will access the software via the Internet, which is hosted on the server of the ASP. The ASP generally owns and maintains the hardware and networking equipment required for the user to access the...
         *
         * See: https://taxcode.avatax.avalara.com/search?q=saas&category=&tab=decision_tree
         */
        taxCode: lineItem.taxCode || "SW054000",
      };

      if (lineItem.taxIncluded !== undefined) {
        avaTaxlineItem.taxIncluded = lineItem.taxIncluded;
      } else {
        if (price.tax_behavior && price.tax_behavior === "inclusive") {
          avaTaxlineItem.taxIncluded = true;
        }
      }

      avaTaxlineItems.push(avaTaxlineItem);
    }
  } catch (err) {
    logger.error(err);
    if (
      err instanceof stripe.errors.StripeError &&
      err.rawType === "invalid_request_error" &&
      err.code === "resource_missing"
    ) {
      respondWithError(res, Boom.badRequest(err.message));
    } else {
      respondWithError(res, Boom.internal());
    }
    return;
  }

  logger.debug(avaTaxlineItems, "Assembled AvaTax line items");
  if (avaTaxlineItems.length === 0) {
    respondWithError(
      res,
      Boom.badRequest(
        "Could not assemble AvaTax line items based on the input."
      )
    );
    return;
  }

  // Fetch tax information
  let createTransactionResponse:
    | AvaTaxApi.CreateTransactionResponse
    | undefined;

  logger.debug("Creating AvaTax transaction");
  try {
    const res = await avatax.post(
      "transactions/create?$include=TaxDetailsByTaxType",
      {
        lines: avaTaxlineItems,
        type: "SalesOrder",
        companyCode: body.companyCode,
        date: "2022-01-29",
        customerCode: "ABC",
        purchaseOrderNo: "2022-01-29-001",
        currency: currency?.toUpperCase(),
        addresses: {
          singleLocation: {
            line1: body.customer.line1,
            city: body.customer.city,
            region: body.customer.state,
            country: body.customer.country,
            postalCode: body.customer.postalCode,
          },
        },
        description: "Starter Plan",
      }
    );
    createTransactionResponse = res.data as AvaTaxApi.CreateTransactionResponse;
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error)) {
      console.log(JSON.stringify(error.response?.data, null, 2));
    }
    respondWithError(res, Boom.internal());

    return;
  }

  const lineItems: CalculateTaxesResponseLineItemsOut[] = [];

  logger.debug("Finding or creating Stripe Tax Rates");
  for (const line of createTransactionResponse.lines) {
    const taxRates: string[] = [];
    for (const detail of line.details) {
      const { avaTaxRateId, taxRate, newlyCreated } =
        await findOrCreateStripeTaxRate(detail, line.taxIncluded);

      taxRates.push(taxRate.id);

      if (newlyCreated) {
        stripeTaxRatesCreated.push(taxRate.id);
      }

      logger.debug(
        `${newlyCreated ? "Created" : "Re-used"} Stripe Tax Rate "${
          taxRate.id
        }" for "${avaTaxRateId}"`
      );
    }
    lineItems.push({
      price: line.ref1!,
      quantity: line.quantity,
      taxRates,
    });
  }

  res.status(200).json({
    stripeTaxRatesCreated,
    lineItems,
    createTransactionResponse,
  });
});
