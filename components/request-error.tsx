import { ExclamationIcon } from "@heroicons/react/solid";
import { AxiosError } from "axios";

export type RequestErrorProps = {
  err: AxiosError;
};

const RequestError = ({ err }: RequestErrorProps) => {
  return (
    <div className="mb-8 rounded-md bg-red-50 p-4 shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon
            className="h-5 w-5 text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Request failed!</h3>
          <div className="mt-2 text-sm text-red-700">
            <code>
              {`${err.config.method?.toUpperCase()} ${err.config.url}`}
              <pre>{`${JSON.stringify(err.response?.data, null, 2)}`}</pre>
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestError;
