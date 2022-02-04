import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );
  return (
    <div className="min-h-full bg-gray-50">
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </div>
  );
}

export default MyApp;
