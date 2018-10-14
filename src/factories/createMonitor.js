// @flow

import prettyMs from 'pretty-ms';
import createThroat from 'throat';
import {
  evaluateRegisteredTest
} from '../routines';
import {
  assertUniqueTestIdPayloads
} from '../assertions';
import Logger from '../Logger';
import type {
  MonitorConfigurationType,
  RegisteredTestType,
  TestType
} from '../types';
import createIntervalRoutine from './createIntervalRoutine';
import createTestId from './createTestId';
import createTestPointer from './createTestPointer';

const log = Logger.child({
  namespace: 'factories/createMonitor'
});

const MAX_PRIORITY = 100;

export default async (configuration: MonitorConfigurationType) => {
  const throat = createThroat(1);

  if (configuration.before) {
    await configuration.before();
  }

  const registeredTests: Array<RegisteredTestType> = [];

  // @todo Validate the shape of the test at a runtime, e.g. the priority range.
  const createRegisteredTest = (test): RegisteredTestType => {
    assertUniqueTestIdPayloads(registeredTests.concat([
      {
        labels: test.labels,
        name: test.name
      }
    ]));

    const id = createTestId({
      labels: test.labels,
      name: test.name
    });

    return {
      consecutiveFailureCount: null,
      id,
      lastError: null,
      lastTestedAt: null,
      testIsFailing: null,
      ...test,
      // eslint-disable-next-line sort-keys
      priority: typeof test.priority === 'number' ? test.priority : MAX_PRIORITY
    };
  };

  const scheduleTest = (registeredTest: RegisteredTestType) => {
    const cancelIntervalRoutine = createIntervalRoutine(async () => {
      await throat(async () => {
        await evaluateRegisteredTest(configuration, registeredTest);
      });

      const delay = registeredTest.interval(registeredTest.consecutiveFailureCount || 0);

      log.debug('assertion complete; delaying the next iteration for %s', prettyMs(delay, {
        verbose: true
      }));

      return delay;
    });

    return cancelIntervalRoutine;
  };

  // @todo Implement configuration.after.

  const testScheduleWeakMap = new WeakMap();

  return {
    getRegisteredTests: () => {
      return registeredTests;
    },
    registerTest: (test: TestType) => {
      const registeredTest = createRegisteredTest(test);

      registeredTests.push(registeredTest);

      const cancelTestSchedule = scheduleTest(registeredTest);

      testScheduleWeakMap.set(registeredTest, cancelTestSchedule);

      log.info({
        test: createTestPointer(registeredTest)
      }, 'registered test');
    },
    runTest: async (test: TestType) => {
      const registeredTest = createRegisteredTest(test);

      await evaluateRegisteredTest(configuration, registeredTest);
    },
    unregisterTest: (test: TestType) => {
      const targetTestId = createTestId(test);

      const maybeRegisteredTest = registeredTests.find((maybeTargetRegisteredTest) => {
        return maybeTargetRegisteredTest.id === targetTestId;
      });

      if (!maybeRegisteredTest) {
        throw new Error('Test not found.');
      }

      const cancelTestSchedule = testScheduleWeakMap.get(maybeRegisteredTest);

      if (!cancelTestSchedule) {
        throw new Error('Cancel test schedule callback not found.');
      }

      cancelTestSchedule();

      registeredTests.splice(registeredTests.indexOf(maybeRegisteredTest), 1);

      log.info({
        test: createTestPointer(maybeRegisteredTest)
      }, 'unregistered test');
    }
  };
};
