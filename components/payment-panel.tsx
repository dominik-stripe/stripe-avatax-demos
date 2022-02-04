import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentIntent, StripeCardElementChangeEvent } from "@stripe/stripe-js";
import Spinner from "./spinner";

export type PaymenetPanelProps = {
  clientSecret: string;
  onChange: ({}) => void;
};

const PaymenetPanel = ({ clientSecret, onChange }: PaymenetPanelProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();

  const onStripeElementChange = (e: StripeCardElementChangeEvent) => {
    if (e.error) {
      setValidationMsg(`${e.error.code} - ${e.error.message}`);
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
      // show error and collect new card details.
      setErrMsg(error.message!);
      setLoading(false);
      setPaymentIntent(undefined);
      return;
    }

    setPaymentIntent(paymentIntent);
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

  if (errMsg) {
    return (
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="text-center text-red-400">
            <div className="flex items-center justify-between">
              <div>Something went wrong: {errMsg}</div>
              <button
                type="button"
                onClick={() => setErrMsg("")}
                className="justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentIntent) {
    return (
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              {paymentIntent.id} - {paymentIntent.status}
            </div>
            <button
              type="button"
              onClick={() => setPaymentIntent(undefined)}
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
    <div className="overflow-hidden shadow sm:rounded-md">
      <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
        <form onSubmit={onSubmit}>
          <div className="flex items-center justify-between">
            <div className="w-10/12">
              <CardElement onChange={onStripeElementChange} />
            </div>
            <div>
              <button
                disabled={loading || !complete}
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Spinner className="-ml-1 mr-3 h-5 w-5" />}
                {loading ? "Paying ..." : "Pay"}
              </button>
            </div>
          </div>
          <div>{validationMsg}</div>
        </form>
      </div>
    </div>
  );
};

export default PaymenetPanel;
