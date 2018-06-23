// @flow

import uuidv5 from 'uuid/v5';
import type {
  TestIdPayloadInputType
} from '../types';
import createTestIdPayload from './createTestIdPayload';

const PALANTIR_TEST = '6b53c21d-8d21-4352-b268-3542d8d9adf0';

export default (test: TestIdPayloadInputType): string => {
  return uuidv5(JSON.stringify(createTestIdPayload(test)), PALANTIR_TEST);
};
