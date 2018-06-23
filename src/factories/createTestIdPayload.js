// @flow

import type {
  TestIdPayloadInputType
} from '../types';

type TestIdPayloadType = {|
  +description: string,
  +tags: $ReadOnlyArray<string>
|};

export default (test: TestIdPayloadInputType): TestIdPayloadType => {
  return {
    description: test.description,
    tags: test.tags.slice(0).sort()
  };
};
