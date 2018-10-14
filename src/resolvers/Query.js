// @flow

import {
  NotFoundError
} from '../errors';
import type {
  ResolverType
} from '../types';

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
          node: registeredTest
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

    return subjectRegisteredTest;
  },
  registeredTests: (root, parameters, context) => {
    const registeredTests = context.monitor.getRegisteredTests();

    const pageInfo = {
      hasNextPage: false
    };

    const edges = registeredTests.map((registeredTest) => {
      return {
        cursor: Buffer.from(registeredTest.id, 'binary').toString('base64'),
        node: registeredTest
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
