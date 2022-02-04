import Stripe from "stripe";
import Boom from "@hapi/boom";
import { postOnly, ErrorResponse, respondWithError } from "@/lib/api";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";

// Setup Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});

const CreateSubscriptionRequestSchema = z.object({
  customerId: z.string(),
  taxFilingCurrency: z.string().optional(),
  items: z.array(
    z.object({
      price: z.string(),
      quantity: z.number().min(1),
      taxRates: z.array(z.string()),
    })
  ),
});

export type CreateSubscriptionRequest = z.infer<
  typeof CreateSubscriptionRequestSchema
>;

export type CreateSubscriptionResponse = {
  subscriptionId: string;
  clientSecret: string;
};

export default postOnly(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSubscriptionResponse | ErrorResponse>
) {
  let body: CreateSubscriptionRequest;

  // Parse request
  try {
    body = CreateSubscriptionRequestSchema.parse(req.body);
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

  try {
    const reqBody = {
      customer: body.customerId,
      items: body.items.map(({ price, taxRates: tax_rates, quantity }) => ({
        price,
        quantity,
        tax_rates,
      })),
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    } as Stripe.SubscriptionCreateParams;

    if (body.taxFilingCurrency) {
      // @ts-ignore
      reqBody.tax_filing_currency = body.taxFilingCurrency;
    }

    const subscription = await stripe.subscriptions.create(reqBody);

    logger.debug(`Created Stripe Subscription "${subscription.id}"`);

    const latestInvoice = subscription.latest_invoice! as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent! as Stripe.PaymentIntent;

    res.status(201).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret!,
    });
  } catch (err) {
    logger.error(err);
    respondWithError(res, Boom.internal());
  }
});
