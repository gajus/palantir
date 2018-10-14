// @flow

import prettyMs from 'pretty-ms';
import {
  NotFoundError
} from '../errors';
import {
  createLabelCollection
} from '../factories';
import {
  explainTest
} from '../routines';
import type {
  ResolverType
} from '../types';

const createTestNode = (registeredTest) => {
  return {
    configuration: registeredTest.configuration,
    consecutiveFailureCount: registeredTest.consecutiveFailureCount,
    explain: (root, parameters) => {
      if (!registeredTest.explain) {
        return null;
      }

      return explainTest(parameters.configuration, registeredTest);
    },
    explainIsAvailable: Boolean(registeredTest.explain),
    id: registeredTest.id,
    interval: {
      human: prettyMs(registeredTest.interval(0), {
        verbose: true
      }),
      milliseconds: registeredTest.interval(0)
    },
    labels: createLabelCollection(registeredTest.labels),
    lastError: registeredTest.lastError,
    lastTestedAt: registeredTest.lastTestedAt ? new Date(registeredTest.lastTestedAt) : null,
    name: registeredTest.name,
    testIsFailing: registeredTest.testIsFailing
  };
};

const Query: ResolverType<void> = {
  failingRegisteredTests: (root, parameters, context) => {
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
  getRegisteredTestById: (root, parameters, context) => {
    const registeredTests = context.monitor.getRegisteredTests();

    const subjectRegisteredTest = registeredTests.find((maybeSubjectRegisteredTest) => {
      return maybeSubjectRegisteredTest.id === parameters.registeredTestId;
    });

    if (!subjectRegisteredTest) {
      throw new NotFoundError();
    }

    return createTestNode(subjectRegisteredTest);
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
