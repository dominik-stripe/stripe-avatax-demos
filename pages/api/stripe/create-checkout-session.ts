import Stripe from "stripe";
import Boom from "@hapi/boom";
import { postOnly, respondWithError } from "@/lib/api";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";

// Setup Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});

const CreateCheckoutSessionRequestSchema = z.object({
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
      tax_rates: z.array(z.string()),
    })
  ),
});

export type CreateCheckoutSessionRequest = z.infer<
  typeof CreateCheckoutSessionRequestSchema
>;

export type CreateCheckoutSessionResponse = {
  url: string;
};

export type CreateCheckoutSessionErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
};

export default postOnly(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    CreateCheckoutSessionResponse | CreateCheckoutSessionErrorResponse
  >
) {
  let body: CreateCheckoutSessionRequest;

  // Parse request
  try {
    body = CreateCheckoutSessionRequestSchema.parse(req.body);
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
      name: body.customer.name,
      email: body.customer.email,
      address: {
        line1: body.customer.line1,
        postal_code: body.customer.postalCode,
        city: body.customer.city,
        state: body.customer.state,
        country: body.customer.country,
      },
    });
    logger.debug(`Created Stripe Customer "${customer.id}"`);

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items:
        body.lineItems as unknown as Stripe.Checkout.SessionCreateParams.LineItem[],
      mode: "subscription",
      success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout?canceled=true`,
    });
    logger.debug(`Created Stripe Checkout Session "${session.id}"`);

    res.status(201).json({
      url: session.url!,
    });
  } catch (err) {
    logger.error(err);
    respondWithError(res, Boom.internal());
  }
});
