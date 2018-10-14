// @flow

import createTestId from '../factories/createTestId';
import Logger from '../Logger';
import type {
  TestIdPayloadInputType
} from '../types';

const log = Logger.child({
  namespace: 'assertUniqueTestIdPayloads'
});

export default (tests: $ReadOnlyArray<TestIdPayloadInputType>): void => {
  const testMap = new Map();

  for (const test of tests) {
    const testId = createTestId(test);

    const first = testMap.get(testId);

    if (first) {
      log.error({
        first,
        second: test
      }, 'found two tests with the same name and labels');

      throw new Error('Test name and labels combination must be unique.');
    }

    testMap.set(testId, test);
  }
};
