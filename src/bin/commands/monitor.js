// @flow

/* eslint-disable import/no-namespace */

import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import GraphQLJSON from 'graphql-type-json';
import {
  GraphQLDateTime
} from 'graphql-iso-date';
import {
  makeExecutableSchema
} from 'graphql-tools';
import * as resolvers from '../../resolvers';
import Logger from '../../Logger';
import {
  createGraphqlMiddleware,
  createMonitor
} from '../../factories';
import {
  importModule
} from '../../utilities';
import type {
  TestType
} from '../../types';

type ArgvType = {|
  +configuration?: string,
  +servicePort: number,
  +tests: $ReadOnlyArray<string>
|};

export const command = 'monitor <tests...>';
export const description = 'Continuously performs user-defined tests and exposes the current state via HTTP API.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      configuration: {
        description: 'Path to the Palantir monitor configuration file.',
        type: 'string'
      },
      'service-port': {
        default: 8080,
        type: 'number'
      }
    });
};

export const handler = async (argv: ArgvType) => {
  const log = Logger.child({
    namespace: 'bin/commands/monitor'
  });

  const schemaDefinition = fs.readFileSync(path.resolve(__dirname, '../../schema.graphql'), 'utf8');

  const schema = makeExecutableSchema({
    resolvers: {
      ...resolvers,
      DateTime: GraphQLDateTime,
      JSON: GraphQLJSON
    },
    typeDefs: schemaDefinition
  });

  let configuration = {};

  if (argv.configuration) {
    configuration = importModule(argv.configuration);
  }

  log.debug({
    tests: argv.tests
  }, 'received %d test file path(s)', argv.tests.length);

  const tests: Array<TestType> = [];

  for (const testFilePath of argv.tests) {
    tests.push(...importModule(testFilePath));
  }

  const monitor = await createMonitor(configuration, tests);

  const app = express();

  app.set('trust proxy', true);
  app.set('x-powered-by', false);

  const graphqlMiddleware = createGraphqlMiddleware(async () => {
    return {
      context: {
        monitor
      },
      schema
    };
  });

  app.use('/', bodyParser.json(), graphqlMiddleware);

  app.listen(argv.servicePort, '0.0.0.0');
};
