// @flow

import prettyMs from 'pretty-ms';
import type {
  ResolverType
} from '../types';

const createTestNode = (registeredTest) => {
  return {
    configuration: registeredTest.configuration,
    consecutiveFailureCount: registeredTest.consecutiveFailureCount,
    description: registeredTest.description,
    id: registeredTest.id,
    interval: {
      human: prettyMs(registeredTest.interval(0), {
        verbose: true
      }),
      milliseconds: registeredTest.interval(0)
    },
    lastQueryResult: registeredTest.lastQueryResult,
    lastTestedAt: registeredTest.lastTestedAt ? new Date(registeredTest.lastTestedAt) : null,
    tags: registeredTest.tags,
    testIsFailing: registeredTest.testIsFailing
  };
};

const Query: ResolverType<void> = {
  failingTests: (root, parameters, context) => {
    const registeredTests = context.monitor.getRegisteredTests();

    const pageInfo = {
      hasNextPage: false
    };

    const edges = registeredTests
      .filter((registeredTest) => {
        return registeredTest.testIsFailing;
      })
      .map((registeredTest) => {
        return {
          cursor: Buffer.from(registeredTest.id, 'binary').toString('base64'),
          node: createTestNode(registeredTest)
        };
      });

    return {
      edges,
      pageInfo,
      totalCount: registeredTests.length
    };
  },
  registeredTests: (root, parameters, context) => {
    const registeredTests = context.monitor.getRegisteredTests();

    const pageInfo = {
      hasNextPage: false
    };

    const edges = registeredTests.map((registeredTest) => {
      return {
        cursor: Buffer.from(registeredTest.id, 'binary').toString('base64'),
        node: createTestNode(registeredTest)
      };
    });

    return {
      edges,
      pageInfo,
      totalCount: registeredTests.length
    };
  }
};

export default Query;
