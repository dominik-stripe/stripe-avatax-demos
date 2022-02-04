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

const CreateCustomerRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  line1: z.string(),
  postalCode: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;

export type CreateCustomerResponse = {
  customerId: string;
};

export default postOnly(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCustomerResponse | ErrorResponse>
) {
  let body: CreateCustomerRequest;

  // Parse request
  try {
    body = CreateCustomerRequestSchema.parse(req.body);
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
    const customer = await stripe.customers.create({
      name: body.name,
      email: body.email,
      address: {
        line1: body.line1,
        postal_code: body.postalCode,
        city: body.city,
        state: body.state,
        country: body.country,
      },
    });
    logger.debug(`Created Stripe Customer "${customer.id}"`);

    res.status(201).json({
      customerId: customer.id,
    });
  } catch (err) {
    logger.error(err);
    respondWithError(res, Boom.internal());
  }
});
