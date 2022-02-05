import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import axios, { AxiosError } from "axios";
import { ShoppingCartIcon } from "@heroicons/react/outline";
import {
  CalculateTaxesRequest,
  CalculateTaxesResponse,
} from "@/pages/api/calculate-taxes";
import { CreateCheckoutSessionRequest } from "@/pages/api/stripe/create-checkout-session";
import Spinner from "@/components/spinner";
import {
  CountriesAndStates,
  statesByCountryCode,
  dummyAddressByCountryCode,
} from "@/lib/addresses";
import { sleepMs } from "@/lib/helpers";
import { companyCodes, prices } from "@/lib/config";
import RequestError from "@/components/request-error";
import TransactionCancelledError from "@/components/transaction-cancelled-error";

const Checkout: NextPage = () => {
  const randomAddress = dummyAddressByCountryCode("DE");
  const [name, setName] = useState("Max Mustermann");
  const [email, setEmail] = useState("max@example.com");
  const [line1, setLine1] = useState(randomAddress.line1);
  const [postalCode, setPostalCode] = useState(randomAddress.postalCode);
  const [city, setCity] = useState(randomAddress.city);
  const [state, setAddressState] = useState(randomAddress.state);
  const [country, setCountry] = useState("DE");
  const [error, setError] = useState<AxiosError>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [companyCode, setCompanyCode] = useState("DEFAULT");
  const [price, setPrice] = useState("price_1KNzzEJ8iWN7g1F1AlsqN3qc");
  const { query } = useRouter();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Calculating taxes and fetching tax rates ...");

    try {
      const reqBody1: CalculateTaxesRequest = {
        companyCode,
        customer: {
          name,
          email,
          country,
          line1,
          postalCode,
          city,
          state,
        },
        lineItems: [
          {
            price,
            taxIncluded,
            quantity: 1,
          },
        ],
      };
      const res1 = await axios.post("/api/calculate-taxes", reqBody1);
      const data1 = res1.data as CalculateTaxesResponse;

      if (data1.stripeTaxRatesCreated.length > 0) {
        setStatus(
          `Calculated taxes and created ${data1.stripeTaxRatesCreated.length} new Stripe Tax Rates ...`
        );
      } else {
        setStatus("Calculated taxes and fetched Stripe Tax Rates ...");
      }

      await sleepMs(1250);

      setStatus("Creating Customer and Checkout Session ...");

      const reqBody2: CreateCheckoutSessionRequest = {
        customer: {
          name,
          email,
          country,
          line1,
          postalCode,
          city,
          state,
        },
        lineItems: data1.lineItems.map((li) => {
          return {
            price: li.price,
            quantity: li.quantity,
            tax_rates: li.taxRates,
          };
        }),
      };
      const res2 = await axios.post(
        "/api/stripe/create-checkout-session",
        reqBody2
      );
      const data = res2.data as { url: string };

      setStatus("Redirecting ...");

      window.location.href = data.url;
    } catch (err) {
      setLoading(false);
      setStatus("");
      if (axios.isAxiosError(err)) {
        setError(err);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Checkout Demo - Stripe x AvaTax Demos</title>
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
            Checkout Demo
          </h2>
        </div>
        {error && <RequestError err={error} />}
        {query.canceled && (
          <TransactionCancelledError dismissHref="/checkout" />
        )}
        <form onSubmit={onSubmit}>
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
                <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-8 divide-y divide-gray-200">
                      <div>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                autoComplete="given-name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Email address
                            </label>
                            <div className="mt-1">
                              <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="country"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Country
                            </label>
                            <div className="mt-1">
                              <select
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={country}
                                onChange={(e) => {
                                  setCountry(e.target.value);
                                  const randomAddress =
                                    dummyAddressByCountryCode(e.target.value);

                                  setLine1(randomAddress.line1);
                                  setPostalCode(randomAddress.postalCode);
                                  setCity(randomAddress.city);
                                  setAddressState(randomAddress.state);
                                }}
                              >
                                {CountriesAndStates.map(({ name, code }) => {
                                  return (
                                    <option
                                      key={`option-country-${code}`}
                                      value={code}
                                    >
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="street-address"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Street (Line 1)
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="street-address"
                                id="street-address"
                                autoComplete="street-address"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={line1}
                                onChange={(e) => setLine1(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="city"
                              className="block text-sm font-medium text-gray-700"
                            >
                              City
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="city"
                                id="city"
                                autoComplete="address-level2"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="state"
                              className="block text-sm font-medium text-gray-700"
                            >
                              State
                            </label>
                            <div className="mt-1">
                              <select
                                id="state"
                                name="state"
                                autoComplete="state-name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={state}
                                onChange={(e) =>
                                  setAddressState(e.target.value)
                                }
                              >
                                {statesByCountryCode(country).map(
                                  ({ name, code }) => {
                                    return (
                                      <option
                                        key={`option-state-${code}`}
                                        value={code}
                                      >
                                        {name}
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="postal-code"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Postal code
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="postal-code"
                                id="postal-code"
                                autoComplete="postal-code"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
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
                        {prices.map(({ value, name }) => {
                          return (
                            <div
                              key={`price-input-${value}`}
                              className="flex items-center"
                            >
                              <input
                                id={`price-input-${value}`}
                                name={`price-input-${value}`}
                                type="radio"
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                value={value}
                                checked={price === value}
                                onChange={(e) => setPrice(e.target.value)}
                              />
                              <label
                                htmlFor={`price-input-${value}`}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {name}
                              </label>
                            </div>
                          );
                        })}
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
        </form>
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
                        price,
                        taxIncluded,
                        customer: {
                          companyCode,
                          line1,
                          postalCode,
                          city,
                          state,
                          country,
                        },
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
