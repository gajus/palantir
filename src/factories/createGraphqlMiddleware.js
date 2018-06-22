// @flow

import {
  Request,
  Response
} from 'express';
import {
  GraphQLOptions,
  runHttpQuery
} from 'graphql-server-core';

/**
 * @todo What is the reason we have written this wrapper?
 */
export default (options: GraphQLOptions) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const gqlResponse = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query: req.method === 'POST' ? req.body : req.query
      });

      // eslint-disable-next-line no-process-env
      res.setHeader('Content-Type', 'application/json');
      res.write(gqlResponse);
      res.end();
    } catch (error) {
      if (error.name === 'HttpQueryError') {
        if (error.headers) {
          Object.keys(error.headers).forEach((header) => {
            res.setHeader(header, error.headers[header]);
          });
        }

        res.statusCode = error.statusCode;
        res.write(error.message);
        res.end();
      } else {
        throw error;
      }
    }
  };
};
