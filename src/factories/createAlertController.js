// @flow

import type {
  RegisteredTestType
} from '../types';

/**
 * @property delayFailure Returns test-specific number of milliseconds to wait before considering the test to be failing.
 * @property delayRecovery Returns test-specific number of milliseconds to wait before considering the test to be recovered.
 * @property onFailure Called when test is considered to be failing.
 * @property onRecovery Called when test is considered to be recovered.
 */
type ConfigurationType = {|
  +delayFailure: (test: RegisteredTestType) => number,
  +delayRecovery: (test: RegisteredTestType) => number,
  +onFailure: (test: RegisteredTestType) => void,
  +onRecovery: (test: RegisteredTestType) => void
|};

type AlertControllerType = {|
  +getDelayedFailingTests: () => $ReadOnlyArray<RegisteredTestType>,
  +getDelayedRecoveringTests: () => $ReadOnlyArray<RegisteredTestType>,
  +registerTestFailure: (test: RegisteredTestType) => void,
  +registerTestRecovery: (test: RegisteredTestType) => void
|};

type TimerIndexType = {
  [key: string]: TimeoutID
};

export default (configuration: ConfigurationType): AlertControllerType => {
  let delayedFailingTests: Array<RegisteredTestType> = [];
  let delayedRecoveringTests: Array<RegisteredTestType> = [];

  const failingTestTimerIndex: TimerIndexType = {};
  const recoveringTestTimerIndex: TimerIndexType = {};

  return {
    getDelayedFailingTests: () => {
      return delayedFailingTests;
    },
    getDelayedRecoveringTests: () => {
      return delayedRecoveringTests;
    },
    registerTestFailure: (test: RegisteredTestType) => {
      const maybeDelayedRecoveringTestIndex = delayedRecoveringTests.findIndex((maybeTargetTest) => {
        return maybeTargetTest.id === test.id;
      });

      if (maybeDelayedRecoveringTestIndex !== -1) {
        clearTimeout(recoveringTestTimerIndex[test.id]);

        delayedRecoveringTests.splice(maybeDelayedRecoveringTestIndex, 1);
      }

      const maybeDelayedTestIndex = delayedFailingTests.findIndex((maybeTargetTest) => {
        return maybeTargetTest.id === test.id;
      });

      if (maybeDelayedTestIndex !== -1) {
        return;
      }

      delayedFailingTests.push(test);

      failingTestTimerIndex[test.id] = setTimeout(() => {
        delayedFailingTests = delayedFailingTests.filter((maybeTargetTest) => {
          return maybeTargetTest.id !== test.id;
        });

        configuration.onFailure(test);
      }, configuration.delayFailure(test));
    },
    registerTestRecovery: (test: RegisteredTestType) => {
      const maybeDelayedRecoveringTestIndex = delayedRecoveringTests.findIndex((maybeTargetTest) => {
        return maybeTargetTest.id === test.id;
      });

      if (maybeDelayedRecoveringTestIndex !== -1) {
        return;
      }

      delayedRecoveringTests.push(test);

      const maybeDelayedFailingTestIndex = delayedFailingTests.findIndex((maybeTargetTest) => {
        return maybeTargetTest.id === test.id;
      });

      if (maybeDelayedFailingTestIndex !== -1) {
        clearTimeout(failingTestTimerIndex[test.id]);

        delayedFailingTests.splice(maybeDelayedFailingTestIndex, 1);
      }

      recoveringTestTimerIndex[test.id] = setTimeout(() => {
        delayedRecoveringTests = delayedRecoveringTests.filter((maybeTargetTest) => {
          return maybeTargetTest.id !== test.id;
        });

        configuration.onRecovery(test);
      }, configuration.delayRecovery(test));
    }
  };
};
