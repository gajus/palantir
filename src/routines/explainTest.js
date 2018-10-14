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
  namespace: 'explainTest'
});

export default async (configuration: MonitorConfigurationType, registeredTest: RegisteredTestType) => {
  if (!registeredTest.explain) {
    throw new Error('Test does not have explain method.');
  }

  const context = configuration.beforeTest ? await configuration.beforeTest(registeredTest) : {};

  let explanationResult;
  let explanationError;

  try {
    explanationResult = await registeredTest.explain(context);
  } catch (error) {
    explanationError = error;

    log.warn({
      error: serializeError(explanationError),
      test: createTestPointer(registeredTest)
    }, '%s test explanation resulted in an error', registeredTest.name);
  }

  if (configuration.afterTest) {
    await configuration.afterTest(registeredTest, context);
  }

  if (explanationError) {
    throw explanationError;
  }

  return explanationResult;
};
