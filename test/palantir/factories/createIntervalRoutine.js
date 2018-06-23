// @flow

import test from 'ava';
import sinon from 'sinon';
import delay from 'delay';
import createIntervalRoutine from '../../../src/factories/createIntervalRoutine';

test('repeats routine every X milliseconds until cancelled', async (t) => {
  const spy = sinon.stub().returns(100);

  const cancel = createIntervalRoutine(spy);

  await delay(550);

  cancel();

  t.true(spy.callCount === 6);
});
