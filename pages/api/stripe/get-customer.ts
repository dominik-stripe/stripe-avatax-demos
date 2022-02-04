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

const GetCustomerRequestSchema = z.object({
  customerId: z.string(),
});

export type GetCustomerRequest = z.infer<typeof GetCustomerRequestSchema>;

export type GetCustomerResponse = {
  customerId: string;
  name: string;
  email: string;
  line1: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
};

export default postOnly(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetCustomerResponse | ErrorResponse>
) {
  let body: GetCustomerRequest;

  // Parse request
  try {
    body = GetCustomerRequestSchema.parse(req.body);
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
    const customer = (await stripe.customers.retrieve(
      body.customerId
    )) as Stripe.Customer;
    logger.debug(`Retrieved Stripe Customer "${customer.id}"`);

    res.status(200).json({
      customerId: customer.id,
      name: customer.name!,
      email: customer.email!,
      line1: customer.address?.line1!,
      postalCode: customer.address?.postal_code!,
      city: customer.address?.city!,
      state: customer.address?.state!,
      country: customer.address?.country!,
    });
  } catch (err) {
    logger.error(err);
    respondWithError(res, Boom.internal());
  }
});
