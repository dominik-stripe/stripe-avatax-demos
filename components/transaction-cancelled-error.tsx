import Link from "next/link";
import { ExclamationIcon } from "@heroicons/react/solid";

export type TransactionCancelledErrorProps = {
  dismissHref: string;
};

const TransactionCancelledError = ({
  dismissHref,
}: TransactionCancelledErrorProps) => {
  return (
    <div className="mb-8 rounded-md bg-yellow-50 p-4 shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Transaction cancelled!
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Please try again ...</p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <Link href={dismissHref} passHref>
                <button
                  type="button"
                  className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  Dismiss
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCancelledError;
