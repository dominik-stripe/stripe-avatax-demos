import { useState } from "react";
import axios from "axios";
import Spinner from "./spinner";
import {
  CountriesAndStates,
  statesByCountryCode,
  dummyAddressByCountryCode,
} from "@/lib/addresses";
import {
  CreateCustomerRequest,
  CreateCustomerResponse,
} from "@/pages/api/stripe/create-customer";

export type CustomerPanelOnChangeInput = {
  customerId: string;
};

export type CustomerPanelProps = {
  onChange: ({}: CustomerPanelOnChangeInput) => void;
};

const CustomerPanel = ({ onChange }: CustomerPanelProps) => {
  const randomAddress = dummyAddressByCountryCode("DE");
  const [name, setName] = useState("Max Mustermann");
  const [email, setEmail] = useState("max@example.com");
  const [line1, setLine1] = useState(randomAddress.line1);
  const [postalCode, setPostalCode] = useState(randomAddress.postalCode);
  const [city, setCity] = useState(randomAddress.city);
  const [state, setAddressState] = useState(randomAddress.state);
  const [country, setCountry] = useState("DE");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const reqBody: CreateCustomerRequest = {
      name,
      email,
      country,
      line1,
      postalCode,
      city,
      state,
    };
    const res = await axios.post("/api/stripe/create-customer", reqBody);
    const data = res.data as CreateCustomerResponse;

    setLoading(false);
    setCustomerId(data.customerId);
    onChange({ customerId: data.customerId });
  };

  const onReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setCustomerId("");
    onChange({ customerId: "" });
  };

  return (
    <form onSubmit={onSubmit} onReset={onReset}>
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
                      disabled={customerId !== ""}
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
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
                      disabled={customerId !== ""}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
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
                      disabled={customerId !== ""}
                      id="country"
                      name="country"
                      autoComplete="country-name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        const randomAddress = dummyAddressByCountryCode(
                          e.target.value
                        );

                        setLine1(randomAddress.line1);
                        setPostalCode(randomAddress.postalCode);
                        setCity(randomAddress.city);
                        setAddressState(randomAddress.state);
                      }}
                    >
                      {CountriesAndStates.map(({ name, code }) => {
                        return (
                          <option key={`option-country-${code}`} value={code}>
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
                      disabled={customerId !== ""}
                      type="text"
                      name="street-address"
                      id="street-address"
                      autoComplete="street-address"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
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
                      disabled={customerId !== ""}
                      type="text"
                      name="city"
                      id="city"
                      autoComplete="address-level2"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
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
                      disabled={customerId !== ""}
                      id="state"
                      name="state"
                      autoComplete="state-name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
                      value={state}
                      onChange={(e) => setAddressState(e.target.value)}
                    >
                      {statesByCountryCode(country).map(({ name, code }) => {
                        return (
                          <option key={`option-state-${code}`} value={code}>
                            {name}
                          </option>
                        );
                      })}
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
                      disabled={customerId !== ""}
                      type="text"
                      name="postal-code"
                      id="postal-code"
                      autoComplete="postal-code"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <div className="flex items-center justify-between">
            <div>{customerId}</div>
            <div>
              {customerId && (
                <button
                  type="reset"
                  className="justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Clear
                </button>
              )}
              {!customerId && (
                <button
                  disabled={loading}
                  type="submit"
                  className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <Spinner className="-ml-1 mr-3 h-5 w-5" />}
                  {loading ? "Creating customer ..." : "Create customer"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CustomerPanel;
