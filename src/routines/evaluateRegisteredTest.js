// @flow

import serializeError from 'serialize-error';
import Logger from '../Logger';
import {
  createTestPointer
} from '../factories';
import type {
  MonitorConfigurationType,
  RegisteredTestType
} from '../types';

const log = Logger.child({
  namespace: 'evaluateRegisteredTest'
});

const updateTest = (registeredTest: RegisteredTestType, assertionResult?: boolean, assertionError?: Error) => {
  const testIsFailing = Boolean(assertionResult === false || assertionError);

  registeredTest.consecutiveFailureCount = testIsFailing ? (registeredTest.consecutiveFailureCount || 0) + 1 : 0;
  registeredTest.lastError = assertionError ? serializeError(assertionError) : null;
  registeredTest.lastTestedAt = Date.now();
  registeredTest.testIsFailing = testIsFailing;
};

export default async (configuration: MonitorConfigurationType, registeredTest: RegisteredTestType) => {
  const context = configuration.beforeTest ? await configuration.beforeTest(registeredTest) : {};

  let assertionResult;
  let assertionError;

  try {
    assertionResult = await registeredTest.assert(context);
  } catch (error) {
    assertionError = error;

    log.warn({
      error: serializeError(assertionError),
      test: createTestPointer(registeredTest)
    }, '%s test assertion resulted in an error', registeredTest.name);
  }

  updateTest(registeredTest, assertionResult, assertionError);

  if (configuration.afterTest) {
    await configuration.afterTest(registeredTest, context);
  }
};
