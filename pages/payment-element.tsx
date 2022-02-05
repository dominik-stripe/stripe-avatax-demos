import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { ShoppingCartIcon, CashIcon } from "@heroicons/react/outline";
import Spinner from "@/components/spinner";
import { sleepMs } from "@/lib/helpers";
import RequestError from "@/components/request-error";
import TransactionCancelledError from "@/components/transaction-cancelled-error";
import { companyCodes } from "@/lib/config";
import CustomerPanel from "@/components/customer-panel";
import SubscriptionPanel from "@/components/subscription-panel";
import PaymentPanel from "@/components/payment-panel";
import { useStripe } from "@stripe/react-stripe-js";

const Checkout: NextPage = () => {
  const [customerId, setCustomerId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [error, setError] = useState<AxiosError>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [companyCode, setCompanyCode] = useState("DEFAULT");
  const { query } = useRouter();

  return (
    <>
      <Head>
        <title>Payment Element Demo - Stripe x AvaTax Demos</title>
      </Head>
      <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
        <div className="mt-4 mb-8 md:grid md:grid-cols-1 md:gap-6">
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            <Link href="/">
              <a>←</a>
            </Link>{" "}
            Payment Element Demo
          </h2>
        </div>
        {error && <RequestError err={error} />}
        <div>
          <div>
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Customer
                  </h3>
                </div>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <CustomerPanel
                  onChange={({ customerId }) => setCustomerId(customerId)}
                />
              </div>
            </div>
          </div>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200" />
            </div>
          </div>
          <div className="mt-10 sm:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Subscription
                  </h3>
                </div>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <SubscriptionPanel
                  customerId={customerId}
                  companyCode={companyCode}
                  onChange={({ subscriptionId, clientSecret }) => {
                    setSubscriptionId(subscriptionId);
                    setClientSecret(clientSecret);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200" />
            </div>
          </div>
          <div className="mt-10 sm:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Payment
                  </h3>
                </div>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <PaymentPanel
                  clientSecret={clientSecret}
                  onChange={({ paymentIntentId }) => {
                    setPaymentIntentId(paymentIntentId);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200" />
            </div>
          </div>
          <div className="mt-10 sm:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Settings
                  </h3>
                </div>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <div className="overflow-hidden shadow sm:rounded-md">
                  <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    <fieldset>
                      <div>
                        <legend className="text-base font-medium text-gray-900">
                          Product
                        </legend>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="tax-included"
                              name="tax-included"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={taxIncluded}
                              onChange={() => setTaxIncluded(!taxIncluded)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="tax-included"
                              className="font-medium text-gray-700"
                            >
                              Tax included
                            </label>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    <fieldset>
                      <div>
                        <legend className="text-base font-medium text-gray-900">
                          Avalara Company Code
                        </legend>
                      </div>
                      <div className="mt-4 space-y-4">
                        {companyCodes.map(({ value, name }) => {
                          return (
                            <div
                              key={`company-juristication-input-${value}`}
                              className="flex items-center"
                            >
                              <input
                                id={`company-juristication-input-${value}`}
                                name="push-notifications"
                                type="radio"
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                value={value}
                                checked={companyCode === value}
                                onChange={(e) => setCompanyCode(e.target.value)}
                              />
                              <label
                                htmlFor={`company-juristication-input-${value}`}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>
                </div>
                <div className="pt-8 pb-3">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <Spinner className="-ml-1 mr-3 h-5 w-5" />
                      ) : (
                        <ShoppingCartIcon
                          className="-ml-1 mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      {status || "Create Checkout Session"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5">
            <div className="border-t border-gray-200" />
          </div>
        </div>
        <div className="mt-4 mb-8 md:grid md:grid-cols-1 md:gap-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Debugging
                </h3>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <pre>
                    {JSON.stringify(
                      {
                        companyCode,
                        taxIncluded,
                        customerId,
                        subscriptionId,
                        clientSecret,
                        paymentIntentId,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
