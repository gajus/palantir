// @flow

import prettyMs from 'pretty-ms';
import uuidv5 from 'uuid/v5';
import createThroat from 'throat';
import {
  evaluateRegisteredTest
} from '../routines';
import {
  assertUniqueTestDescriptions
} from '../assertions';
import Logger from '../Logger';
import type {
  MonitorConfigurationType,
  RegisteredTestType,
  TestType
} from '../types';
import createIntervalRoutine from './createIntervalRoutine';

const log = Logger.child({
  namespace: 'factories/createMonitor'
});

const PALANTIR_TEST = '6b53c21d-8d21-4352-b268-3542d8d9adf0';

export default async (configuration: MonitorConfigurationType, tests: $ReadOnlyArray<TestType>) => {
  assertUniqueTestDescriptions(tests);

  const registeredTests: $ReadOnlyArray<RegisteredTestType> = tests.map((test) => {
    const id = uuidv5(test.description, PALANTIR_TEST);

    return {
      ...test,
      consecutiveFailureCount: null,
      id,
      lastTestedAt: null,
      testIsFailing: null
    };
  });

  const throat = createThroat(1);

  if (configuration.before) {
    await configuration.before();
  }

  const scheduleTest = async (registeredTest: RegisteredTestType) => {
    createIntervalRoutine(async () => {
      await throat(async () => {
        await evaluateRegisteredTest(configuration, registeredTest);
      });

      const delay = registeredTest.interval(registeredTest.consecutiveFailureCount || 0);

      log.debug('assertion complete; delaying the next iteration for %s', prettyMs(delay, {
        verbose: true
      }));

      return delay;
    });
  };

  for (const registeredTest of registeredTests) {
    scheduleTest(registeredTest);
  }

  // @todo Implement configuration.after.

  return {
    getRegisteredTests: () => {
      return registeredTests;
    }
  };
};
