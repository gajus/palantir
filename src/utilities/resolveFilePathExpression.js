// @flow

import {
  sync as glob
} from 'glob';

export default (input: string | $ReadOnlyArray<string>) => {
  const filePathExpressions = Array.isArray(input) ? input : [input];

  const filePaths = [];

  for (const filePathExpression of filePathExpressions) {
    const resolvedFilePaths = glob(filePathExpression);

    filePaths.push(...resolvedFilePaths);
  }

  return filePaths;
};
