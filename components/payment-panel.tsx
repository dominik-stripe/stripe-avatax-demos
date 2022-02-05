import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  PaymentIntent,
  StripeCardElementChangeEvent,
  StripeError,
} from "@stripe/stripe-js";
import Spinner from "./spinner";
import { ExclamationIcon } from "@heroicons/react/solid";

export type PaymenetPanelOnChangeInput = {
  paymentIntentId: string;
};

export type PaymenetPanelProps = {
  clientSecret: string;
  onChange: ({}: PaymenetPanelOnChangeInput) => void;
};

const PaymenetPanel = ({ clientSecret, onChange }: PaymenetPanelProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [err, setErr] = useState<StripeError>();

  const [validationMsg, setValidationMsg] = useState("");
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();

  const onStripeElementChange = (e: StripeCardElementChangeEvent) => {
    if (e.error) {
      setValidationMsg(`${e.error.message} (${e.error.code})`);
    } else {
      setValidationMsg("");
    }

    setComplete(e.complete);
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!complete) {
      return;
    }

    setLoading(true);

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements!.getElement(CardElement)!;

    // Use card Element to tokenize payment details
    let { error, paymentIntent } = await stripe!.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      console.log(error);
      setErr(error);
      setLoading(false);
      setPaymentIntent(undefined);
      return;
    }

    if (paymentIntent) {
      setPaymentIntent(paymentIntent);
      onChange({ paymentIntentId: paymentIntent.id });
    }

    setLoading(false);
  };

  const onReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPaymentIntent(undefined);
    setErr(undefined);
    setValidationMsg("");
    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="text-center text-gray-400">
            Please create a subscription first ...
          </div>
        </div>
      </div>
    );
  }

  if (!stripe || !elements) {
    return (
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="text-center text-gray-400">Loading Stripe.js ...</div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Attention needed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-2">
                    {err.message} ({err.code})<br />
                  </p>
                  <a
                    href={err.doc_url}
                    className="font-medium text-red-700 hover:text-red-600"
                  >
                    Details <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <div className="flex items-center justify-between">
            <div></div>
            <button
              type="button"
              onClick={() => {
                setErr(undefined);
              }}
              className="justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onReset={onReset}>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          {validationMsg && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Attention needed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{validationMsg}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <CardElement
            onChange={onStripeElementChange}
            options={{ disabled: paymentIntent !== undefined }}
          />
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              {paymentIntent && (
                <div>
                  {paymentIntent.id} - {paymentIntent.status}
                </div>
              )}
            </div>
            {paymentIntent && (
              <button
                type="reset"
                className="justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
            )}
            {!paymentIntent && (
              <button
                disabled={loading || !complete}
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Spinner className="-ml-1 mr-3 h-5 w-5" />}
                {loading ? "Paying ..." : "Pay"}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PaymenetPanel;
