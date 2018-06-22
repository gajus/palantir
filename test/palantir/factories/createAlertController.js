// @flow

import test from 'ava';
import sinon from 'sinon';
import delay from 'delay';
import type {
  RegisteredTestType
} from '../../../src/types';
import createAlertController from '../../../src/factories/createAlertController';

const createRegisteredTest = (id: number): RegisteredTestType => {
  // eslint-disable-next-line flowtype/no-weak-types
  const registeredTest: any = {
    id
  };

  return registeredTest;
};

const assertControllerState = (
  t,
  controller,
  failureSpy,
  recoverySpy,
  onFailureIsCalled: boolean,
  onRecoveryIsCalled: boolean,
  delayedFailingTestCount: number,
  delayedRecoveringTestCount: number
) => {
  t.true(failureSpy.called === onFailureIsCalled);
  t.true(recoverySpy.called === onRecoveryIsCalled);
  t.true(controller.getDelayedFailingTests().length === delayedFailingTestCount);
  t.true(controller.getDelayedRecoveringTests().length === delayedRecoveringTestCount);
};

const constant = (value) => {
  return () => {
    return value;
  };
};

test('registered failing test is delayed `delayFailure` milliseconds before `onFailure` is triggered', async (t) => {
  const failureSpy = sinon.spy();
  const recoverySpy = sinon.spy();

  const controller = createAlertController({
    delayFailure: constant(100),
    delayRecovery: constant(100),
    onFailure: failureSpy,
    onRecovery: recoverySpy
  });

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 0);

  const failingTest = createRegisteredTest(1);

  controller.registerTestFailure(failingTest);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 1, 0);

  await delay(100);

  assertControllerState(t, controller, failureSpy, recoverySpy, true, false, 0, 0);

  t.true(failureSpy.calledOnce);
  t.true(failureSpy.calledWith(failingTest));
});

test('registered failing test does not trigger `onFailure` if test recovers within `delayFailure` milliseconds', async (t) => {
  const failureSpy = sinon.spy();
  const recoverySpy = sinon.spy();

  const controller = createAlertController({
    delayFailure: constant(100),
    delayRecovery: constant(100),
    onFailure: failureSpy,
    onRecovery: recoverySpy
  });

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 0);

  const failingTest = createRegisteredTest(1);

  controller.registerTestFailure(failingTest);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 1, 0);

  await delay(50);

  controller.registerTestRecovery(failingTest);

  await delay(100);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, true, 0, 0);
});

test('registering the same test multiple times does not create duplicate `delayedTest` entries', (t) => {
  const controller = createAlertController({
    delayFailure: constant(100),
    delayRecovery: constant(100),
    onFailure: () => {},
    onRecovery: () => {}
  });

  t.true(controller.getDelayedFailingTests().length === 0);

  controller.registerTestFailure(createRegisteredTest(1));

  t.true(controller.getDelayedFailingTests().length === 1);

  controller.registerTestFailure(createRegisteredTest(1));

  t.true(controller.getDelayedFailingTests().length === 1);

  controller.registerTestFailure(createRegisteredTest(2));

  t.true(controller.getDelayedFailingTests().length === 2);
});

test('registered recovering test is delayed `delayRecovery` milliseconds before `onRecovery` is triggered', async (t) => {
  const failureSpy = sinon.spy();
  const recoverySpy = sinon.spy();

  const controller = createAlertController({
    delayFailure: constant(100),
    delayRecovery: constant(100),
    onFailure: failureSpy,
    onRecovery: recoverySpy
  });

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 0);

  const failingTest = createRegisteredTest(1);

  controller.registerTestFailure(failingTest);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 1, 0);

  await delay(50);

  controller.registerTestRecovery(failingTest);

  await delay(50);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 1);

  await delay(100);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, true, 0, 0);

  t.true(recoverySpy.calledOnce);
  t.true(recoverySpy.calledWith(failingTest));
});

test('registered recovering test fails if another failure is detected within a `delayRecovery` timeframe without further recovery within `delayFailure` timeframe', async (t) => {
  const failureSpy = sinon.spy();
  const recoverySpy = sinon.spy();

  const controller = createAlertController({
    delayFailure: constant(100),
    delayRecovery: constant(100),
    onFailure: failureSpy,
    onRecovery: recoverySpy
  });

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 0);

  const failingTest = createRegisteredTest(1);

  controller.registerTestFailure(failingTest);

  await delay(50);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 1, 0);

  controller.registerTestRecovery(failingTest);

  await delay(50);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 0, 1);

  controller.registerTestFailure(failingTest);

  await delay(50);

  assertControllerState(t, controller, failureSpy, recoverySpy, false, false, 1, 0);

  await delay(200);

  assertControllerState(t, controller, failureSpy, recoverySpy, true, false, 0, 0);
});
