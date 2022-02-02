import Head from "next/head";
import { NextPage, GetServerSideProps } from "next";
import Stripe from "stripe";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  if (!query || !query.session_id) {
    return {
      props: {},
    };
  }

  const sessionId = Array.isArray(query.session_id)
    ? query.session_id[0]
    : query.session_id;

  let session: Stripe.Checkout.Session | null = null;
  let customer: Stripe.Customer | null = null;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
    customer = (await stripe.customers.retrieve(
      session.customer as string
    )) as Stripe.Customer;
  } catch (err) {
    console.log(err);
  }

  return { props: { session, customer } };
};

export interface CheckoutSuccessPageProps {
  session: Stripe.Checkout.Session | null;
  customer: Stripe.Customer | null;
}

const CheckoutSuccessPage: NextPage<CheckoutSuccessPageProps> = ({
  session,
  customer,
}) => {
  if (!session || !customer) {
    return (
      <div className="bg-white">
        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-7xl py-16 sm:px-2 lg:px-8"
        >
          <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <h2
              id="features-heading"
              className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            >
              Thank you for your order!
            </h2>
            <p className="mt-4 text-gray-500">
              We couldn&apos;t retrieve session or customer information, but
              assume everything went well!
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-7xl py-16 sm:px-2 lg:px-8"
      >
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            Thank you for your order, {customer.name}!
          </h2>
          <p className="mt-4 text-gray-500">
            Find Session and Customer objects below.
          </p>
          <h3 className="text-l mt-2 font-extrabold tracking-tight text-gray-900 sm:text-xl">
            Customer:
          </h3>
          <code>
            <pre>{JSON.stringify(customer, null, 2)}</pre>
          </code>
          <h3 className="text-l mt-2 font-extrabold tracking-tight text-gray-900 sm:text-xl">
            Session:
          </h3>
          <code>
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </code>
        </div>
      </section>
    </div>
  );
};

export default CheckoutSuccessPage;
