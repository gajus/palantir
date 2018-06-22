// @flow

import type {
  TestType
} from '../types';
import Logger from '../Logger';

const log = Logger.child({
  namespace: 'assertUniqueTestDescriptions'
});

export default (tests: $ReadOnlyArray<TestType>): void => {
  const testMap = new Map();

  for (const test of tests) {
    if (testMap.has(test.description)) {
      log.error({
        first: testMap.get(test.description),
        second: test
      }, 'found two tests with the same description');

      throw new Error('Test description must be unique.');
    }

    testMap.set(test.description, test);
  }
};
