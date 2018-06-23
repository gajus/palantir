// @flow

import delay from 'delay';

type IntervalRoutineType = () => Promise<number>;

export default (routine: IntervalRoutineType) => {
  let run = true;

  (async () => {
    // eslint-disable-next-line no-unmodified-loop-condition
    while (run) {
      await delay(await routine());
    }
  })();

  return () => {
    run = false;
  };
};
