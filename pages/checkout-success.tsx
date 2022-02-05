import Head from "next/head";
import Link from "next/link";
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
  return (
    <>
      <Head>
        <title>Checkout Success - Stripe x AvaTax Demos</title>
      </Head>
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
              <Link href="/">
                <a>←</a>
              </Link>{" "}
              {(!session || !customer) && "Thank you for your order!"}
              {customer && `Thank you for your order, ${customer.name}!`}
            </h2>
          </div>
          {customer && (
            <div className="mx-auto mt-4 max-w-2xl px-4 lg:max-w-none lg:px-0">
              <h3 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                Customer details:
              </h3>
              <code>
                <pre>{JSON.stringify(customer, null, 2)}</pre>
              </code>
            </div>
          )}
          {session && (
            <div className="mx-auto mt-4 max-w-2xl px-4 lg:max-w-none lg:px-0">
              <h3 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                Session details:
              </h3>
              <code>
                <pre>{JSON.stringify(session, null, 2)}</pre>
              </code>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default CheckoutSuccessPage;
