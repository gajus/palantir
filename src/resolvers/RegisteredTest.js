// @flow

import prettyMs from 'pretty-ms';
import {
  createLabelCollection
} from '../factories';
import {
  explainTest
} from '../routines';
import type {
  RegisteredTestType,
  ResolverType
} from '../types';

const RegisteredTest: ResolverType<RegisteredTestType> = {
  explain: (registeredTest, parameters, context) => {
    if (!registeredTest.explain) {
      return null;
    }

    return explainTest(context.configuration, registeredTest);
  },
  explainIsAvailable: (registeredTest) => {
    return Boolean(registeredTest.explain);
  },
  interval: (registeredTest) => {
    return {
      human: prettyMs(registeredTest.interval(0), {
        verbose: true
      }),
      milliseconds: registeredTest.interval(0)
    };
  },
  labels: (registeredTest) => {
    return createLabelCollection(registeredTest.labels);
  },
  lastTestedAt: (registeredTest) => {
    return registeredTest.lastTestedAt ? new Date(registeredTest.lastTestedAt) : null;
  }
};

export default RegisteredTest;
