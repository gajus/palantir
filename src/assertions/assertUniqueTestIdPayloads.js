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

    if (testMap.has(testId)) {
      log.error({
        first: testMap.get(testId),
        second: test
      }, 'found two tests with the same description and tags');

      throw new Error('Test description and tags combination must be unique.');
    }

    testMap.set(testId, test);
  }
};
