// @flow

import test from 'ava';
import sinon from 'sinon';
import delay from 'delay';
import createIntervalRoutine from '../../../src/factories/createIntervalRoutine';

test('repeats routine every X milliseconds until cancelled', async (t) => {
  const spy = sinon.spy();

  const cancel = createIntervalRoutine(spy, 100);

  await delay(550);

  cancel();

  t.true(spy.callCount === 6);
});
