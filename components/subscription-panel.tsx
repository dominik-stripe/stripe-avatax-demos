import { useState } from "react";
import axios from "axios";
import { prices } from "@/lib/config";
import Spinner from "./spinner";
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from "@/pages/api/stripe/create-subscription";
import {
  GetCustomerRequest,
  GetCustomerResponse,
} from "@/pages/api/stripe/get-customer";
import {
  CalculateTaxesRequest,
  CalculateTaxesResponse,
} from "@/pages/api/calculate-taxes";

export type SubscriptionPanelOnChangeInput = {
  subscriptionId: string;
  clientSecret: string;
};

export type SubscriptionPanelProps = {
  customerId: string;
  companyCode: string;
  onChange: ({}: SubscriptionPanelOnChangeInput) => void;
};

const SubscriptionPanel = ({
  customerId,
  companyCode,
  onChange,
}: SubscriptionPanelProps) => {
  const [price, setPrice] = useState("price_1KNzzEJ8iWN7g1F1AlsqN3qc");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const resCustomer = await axios.post("/api/stripe/get-customer", {
      customerId,
    } as GetCustomerRequest);
    const customer = resCustomer.data as GetCustomerResponse;
    const resTax = await axios.post("/api/calculate-taxes", {
      companyCode,
      customer: {
        name: customer.name,
        email: customer.email,
        country: customer.country,
        line1: customer.line1,
        postalCode: customer.postalCode,
        city: customer.city,
        state: customer.state,
      },
      lineItems: [
        {
          price,
          taxIncluded: true,
          quantity: 1,
        },
      ],
    } as CalculateTaxesRequest);
    const taxRates = resTax.data as CalculateTaxesResponse;

    const reqBody: CreateSubscriptionRequest = {
      customerId,
      items: taxRates.lineItems,
    };

    if (customer.country === "DE") {
      reqBody.taxFilingCurrency = "EUR";
    }

    if (customer.country === "GB") {
      reqBody.taxFilingCurrency = "GBP";
    }

    const res = await axios.post("/api/stripe/create-subscription", reqBody);
    const data = res.data as CreateSubscriptionResponse;

    setLoading(false);
    setSubscriptionId(data.subscriptionId);
    onChange({
      subscriptionId: data.subscriptionId,
      clientSecret: data.clientSecret,
    });
  };
  const onReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setSubscriptionId("");
    onChange({ subscriptionId: "", clientSecret: "" });
  };

  if (!customerId) {
    return (
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="text-center text-gray-400">
            Please create a customer first ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onReset={onReset}>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
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
                      disabled={subscriptionId !== ""}
                      id={`price-input-${value}`}
                      name={`price-input-${value}`}
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50"
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
            </div>
          </fieldset>
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <div className="flex items-center justify-between">
            <div>{subscriptionId}</div>
            {customerId && !subscriptionId && (
              <button
                disabled={loading}
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Spinner className="-ml-1 mr-3 h-5 w-5" />}
                {loading ? "Creating subscription ..." : "Create subscription"}
              </button>
            )}
            {subscriptionId && (
              <button
                type="reset"
                className="justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default SubscriptionPanel;
