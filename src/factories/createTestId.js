// @flow

import uuidv5 from 'uuid/v5';

type TestFragmentType = {
  +description: string
};

const PALANTIR_TEST = '6b53c21d-8d21-4352-b268-3542d8d9adf0';

export default (test: TestFragmentType): string => {
  return uuidv5(test.description, PALANTIR_TEST);
};
