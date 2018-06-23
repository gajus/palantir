// @flow

import serializeError from 'serialize-error';
import Logger from '../Logger';
import type {
  MonitorConfigurationType,
  RegisteredTestType,
  QueryResultType
} from '../types';

const log = Logger.child({
  namespace: 'evaluateRegisteredTest'
});

const updateTest = (registeredTest: RegisteredTestType, completedWithError: boolean, queryResult: QueryResultType) => {
  registeredTest.consecutiveFailureCount = completedWithError ? (registeredTest.consecutiveFailureCount || 0) + 1 : 0;
  registeredTest.lastTestedAt = Date.now();
  registeredTest.testIsFailing = completedWithError;
  registeredTest.lastQueryResult = queryResult;
};

export default async (configuration: MonitorConfigurationType, registeredTest: RegisteredTestType) => {
  const context = configuration.beforeTest ? await configuration.beforeTest(registeredTest) : {};

  let completedWithError = false;

  let queryResult = null;

  try {
    queryResult = await registeredTest.query(context);
  } catch (error) {
    completedWithError = true;

    log.error({
      error: serializeError(error),
      test: registeredTest
    }, '%s query resulted in an error', registeredTest.description);
  }

  if (!completedWithError && registeredTest.assert && !registeredTest.assert(queryResult)) {
    completedWithError = true;

    updateTest(registeredTest, completedWithError, queryResult);

    log.error({
      test: registeredTest
    }, '%s assertion failed', registeredTest.description);
  } else {
    updateTest(registeredTest, completedWithError, queryResult);
  }

  if (configuration.afterTest) {
    await configuration.afterTest(registeredTest, context);
  }
};
