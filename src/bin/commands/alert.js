// @flow

import delay from 'delay';
import {
  differenceBy
} from 'lodash';
import {
  ApolloClient
} from 'apollo-client';
import gql from 'graphql-tag';
import {
  importModule
} from '../../utilities';
import {
  createGraphqlClient
} from '../../factories';
import Logger from '../../Logger';

type ArgvType = {|
  +configuration: string,
  +palantirApiUrl: string,
  +tests: $ReadOnlyArray<string>
|};

const log = Logger.child({
  namespace: 'bin/commands/alert'
});

const queryFailingTests = async (graphqlClient: ApolloClient) => {
  // eslint-disable-next-line no-restricted-syntax
  const query = gql`
    {
      failingTests {
        edges {
          node {
            id
            description
            tags
            lastTestedAt
            testIsFailing
          }
        }
      }
    }
  `;

  const result = await graphqlClient.query({
    fetchPolicy: 'no-cache',
    query
  });

  return result.data.failingTests.edges.map((edge) => {
    return edge.node;
  });
};

export const command = 'alert';
export const description = 'Subscribes to the Palantir HTTP API and alerts other systems using-defined configuration.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      configuration: {
        demand: true,
        description: 'Path to the Palantir alert configuration file.',
        type: 'string'
      },
      'palantir-api-url': {
        demand: true,
        type: 'string'
      }
    });
};

export const handler = async (argv: ArgvType) => {
  const configuration = importModule(argv.configuration);

  const graphqlClient = createGraphqlClient(argv.palantirApiUrl);

  let knownFailingTests = [];

  const identifyTest = (test) => {
    return test.id;
  };

  const onNewFailingTest = configuration.onNewFailingTest;
  const onRecoveredTest = configuration.onRecoveredTest;

  while (true) {
    const failingTests = await queryFailingTests(graphqlClient);

    const newFailingTests = differenceBy(failingTests, knownFailingTests, identifyTest);

    knownFailingTests.push(...newFailingTests);

    const recoveredTests = differenceBy(knownFailingTests, failingTests, identifyTest);

    knownFailingTests = differenceBy(knownFailingTests, recoveredTests, identifyTest);

    if (newFailingTests.length || recoveredTests.length) {
      log.info({
        failingTests,
        newFailingTests,
        recoveredTests
      }, 'new test state');
    } else {
      log.debug('no change of test state');
    }

    if (onNewFailingTest && newFailingTests.length) {
      for (const newFailingTest of newFailingTests) {
        onNewFailingTest(newFailingTest);
      }
    }

    if (onRecoveredTest && recoveredTests.length) {
      for (const recoveredTest of recoveredTests) {
        onRecoveredTest(recoveredTest);
      }
    }

    log.debug('delaying next check by 5 seconds');

    // @todo Use GraphQL subscriptions.
    await delay(5 * 1000);
  }
};
