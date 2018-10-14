// @flow

import test from 'ava';
import sinon from 'sinon';
import type {
  MonitorConfigurationType,
  RegisteredTestType
} from '../../../src/types';
import evaluateRegisteredTest from '../../../src/routines/evaluateRegisteredTest';

const createTest = (registeredTest: $Shape<{...RegisteredTestType}> = {}): RegisteredTestType => {
  return {
    // @see https://github.com/facebook/flow/issues/6974
    ...{
      // eslint-disable-next-line no-unused-vars
      assert: async (context) => {
        return true;
      },
      consecutiveFailureCount: null,
      id: '1',
      // eslint-disable-next-line no-unused-vars
      interval: (consecutiveFailureCount) => {
        return 100;
      },
      labels: {},
      lastError: null,
      lastTestedAt: null,
      name: '',
      testIsFailing: null
    },
    ...registeredTest
  };
};

const createTestConfiguration = (input: $Shape<{...MonitorConfigurationType}>): MonitorConfigurationType => {
  return {
    after: () => {},
    afterTest: () => {},
    before: () => {},
    beforeTest: () => {
      return {};
    },
    ...input
  };
};

test('calls assert', async (t) => {
  const registeredTest = createTest();

  const spy = sinon.spy(registeredTest, 'assert');

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 0);
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === false);
});

test('uses beforeTest to create assertion context', async (t) => {
  const expectedContext = {};

  const configuration = createTestConfiguration({
    beforeTest: () => {
      return expectedContext;
    }
  });

  const registeredTest = createTest();

  const spy = sinon.spy(registeredTest, 'assert');

  await evaluateRegisteredTest(configuration, registeredTest);

  t.true(spy.calledOnce);
  t.true(spy.calledWith(expectedContext));
});

test('uses afterTest to teardown code', async (t) => {
  const expectedContext = {};

  const configuration = createTestConfiguration({
    beforeTest: () => {
      return expectedContext;
    }
  });

  const registeredTest = createTest();

  const spy = sinon.spy(configuration, 'afterTest');

  await evaluateRegisteredTest(configuration, registeredTest);

  t.true(spy.calledOnce);
  t.true(spy.calledWith(registeredTest, expectedContext));
});

test('marks test as failing if assertion throws an error', async (t) => {
  const registeredTest = createTest();

  const spy = sinon
    .stub(registeredTest, 'assert')
    .callsFake(() => {
      throw new Error('foo');
    });

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 1);
  t.true(registeredTest.lastError && registeredTest.lastError.message === 'foo');
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === true);
});

test('marks test as failing if assert returns false', async (t) => {
  const registeredTest = createTest();

  const spy = sinon
    .stub(registeredTest, 'assert')
    .callsFake(() => {
      return false;
    });

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 1);
  t.true(registeredTest.lastError === null);
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === true);
});
