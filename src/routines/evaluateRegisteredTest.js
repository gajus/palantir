// @flow

import prettyMs from 'pretty-ms';
import serializeError from 'serialize-error';
import Logger from '../Logger';
import type {
  MonitorConfigurationType,
  RegisteredTestType
} from '../types';

const log = Logger.child({
  namespace: 'evaluateRegisteredTest'
});

export default async (configuration: MonitorConfigurationType, registeredTest: RegisteredTestType) => {
  const context = configuration.beforeTest ? await configuration.beforeTest(registeredTest.configuration) : {};

  let completedWithError = false;

  let queryResult;

  try {
    queryResult = await registeredTest.query(context);
  } catch (error) {
    completedWithError = true;

    log.error({
      error: serializeError(error)
    }, '%s query resulted in an error', registeredTest.description);
  }

  if (!completedWithError && registeredTest.assert) {
    if (!registeredTest.assert(queryResult)) {
      completedWithError = true;

      log.error('%s assertion failed', registeredTest.description);
    }
  }

  registeredTest.consecutiveFailureCount = completedWithError ? (registeredTest.consecutiveFailureCount || 0) + 1 : 0;
  registeredTest.lastTestedAt = Date.now();
  registeredTest.testIsFailing = completedWithError;

  log.debug('assertion complete; delaying the next iteration for %s', prettyMs(registeredTest.interval(registeredTest.consecutiveFailureCount || 0), {
    verbose: true
  }));

  if (configuration.afterTest) {
    await configuration.afterTest(registeredTest.configuration, context);
  }
};
