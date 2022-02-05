import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Stripe x AvaTax Demos</title>
      </Head>
      <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
        <div className="mt-4 mb-8 md:grid md:grid-cols-1 md:gap-6">
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            Stripe x AvaTax
          </h2>
        </div>
        <div>
          <ul className="list-inside list-disc">
            <li>
              <Link href="/checkout">
                <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Checkout Demo
                </a>
              </Link>
            </li>
            <li>
              <Link href="/payment-element">
                <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Payment Element Demo
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Home;
