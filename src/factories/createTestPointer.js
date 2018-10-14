// @flow

import type {
  TestType,
  RegisteredTestType
} from '../types';
import createLabelCollection from './createLabelCollection';

type TestPointerType = {|
  +id?: string,
  +labels: $ReadOnlyArray<string>,
  +name: string
|};

export default (test: TestType | RegisteredTestType): TestPointerType => {
  // eslint-disable-next-line flowtype/no-weak-types
  const pointer: Object = {
    labels: Array.isArray(test.labels) ? test.labels : createLabelCollection(test.labels),
    name: test.name
  };

  if (test.id) {
    pointer.id = test.id;
  }

  return pointer;
};
