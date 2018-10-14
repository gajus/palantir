// @flow

import type {
  LabelCollectionType,
  TestIdPayloadInputType
} from '../types';
import createLabelCollection from './createLabelCollection';

type TestIdPayloadType = {|
  +labels: LabelCollectionType,
  +name: string
|};

export default (test: TestIdPayloadInputType): TestIdPayloadType => {
  return {
    labels: createLabelCollection(test.labels),
    name: test.name
  };
};
