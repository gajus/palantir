// @flow

import delay from 'delay';

// eslint-disable-next-line flowtype/no-weak-types
export default (routine: Function, intervalTime: number) => {
  let run = true;

  (async () => {
    // eslint-disable-next-line no-unmodified-loop-condition
    while (run) {
      await routine();
      await delay(intervalTime);
    }
  })();

  return () => {
    run = false;
  };
};
