import Boom from "@hapi/boom";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const respondWithError = (res: NextApiResponse, err: Boom.Boom) => {
  Object.keys(err.output.headers).forEach((key) => {
    const value = err.output.headers[key];

    if (value) {
      res.setHeader(key, value);
    }
  });

  res.status(err.output.statusCode).json(err.output.payload);
};

export const getOnly =
  (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      respondWithError(
        res,
        Boom.methodNotAllowed(undefined, undefined, ["GET"])
      );
      return;
    }

    return handler(req, res);
  };

export const postOnly =
  (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      respondWithError(
        res,
        Boom.methodNotAllowed(undefined, undefined, ["POST"])
      );
      return;
    }

    return handler(req, res);
  };

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
