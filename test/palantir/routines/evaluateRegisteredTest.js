// @flow

import test from 'ava';
import sinon from 'sinon';
import type {
  MonitorConfigurationType
} from '../../../src/types';
import evaluateRegisteredTest from '../../../src/routines/evaluateRegisteredTest';

const createTest = (id: string) => {
  return {
    assert: () => {
      return true;
    },
    configuration: {},
    consecutiveFailureCount: null,
    description: '',
    id,
    interval: () => {
      return 100;
    },
    lastTestedAt: null,
    query: async () => {},
    tags: [],
    testIsFailing: null
  };
};

test('calls query', async (t) => {
  const registeredTest = createTest('1');

  const spy = sinon.spy(registeredTest, 'query');

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 0);
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === false);
});

test('uses beforeTest to create query context', async (t) => {
  const expectedContext = {};

  const configuration: MonitorConfigurationType = ({
    beforeTest: () => {
      return expectedContext;
    }
  }: any);

  const registeredTest = createTest('1');

  const spy = sinon.spy(registeredTest, 'query');

  await evaluateRegisteredTest(configuration, registeredTest);

  t.true(spy.calledOnce);
  t.true(spy.calledWith(expectedContext));
});

test('uses afterTest to teardown code', async (t) => {
  const expectedConfiguration = {};
  const expectedContext = {};

  const configuration: MonitorConfigurationType = ({
    afterTest: () => {},
    beforeTest: () => {
      return expectedContext;
    }
  }: any);

  const registeredTest = createTest('1');

  registeredTest.configuration = expectedConfiguration;

  const spy = sinon.spy(configuration, 'afterTest');

  await evaluateRegisteredTest(configuration, registeredTest);

  t.true(spy.calledOnce);
  t.true(spy.calledWith(registeredTest, expectedContext));
});

test('marks test as failing if query throws an error', async (t) => {
  const registeredTest = createTest('1');

  const spy = sinon
    .stub(registeredTest, 'query')
    .callsFake(() => {
      throw new Error('test');
    });

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 1);
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === true);
});

test('calls assert with query result', async (t) => {
  const registeredTest = createTest('1');

  const result = Math.random();

  sinon.stub(registeredTest, 'query').returns(result);

  const spy = sinon.stub(registeredTest, 'assert');

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(spy.calledWith(result));
});

test('marks test as failing if assert returns false', async (t) => {
  const registeredTest = createTest('1');

  const spy = sinon
    .stub(registeredTest, 'assert')
    .callsFake(() => {
      return false;
    });

  await evaluateRegisteredTest({}, registeredTest);

  t.true(spy.calledOnce);
  t.true(registeredTest.consecutiveFailureCount === 1);
  t.true(registeredTest.lastTestedAt !== null);
  t.true(registeredTest.testIsFailing === true);
});
