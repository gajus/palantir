// @flow

import parseRegex from 'regex-parser';
import Logger from '../../Logger';
import {
  createMonitor
} from '../../factories';
import {
  importModule,
  resolveFilePathExpression
} from '../../utilities';
import type {
  TestSuiteType
} from '../../types';

type ArgvType = {|
  +configuration?: string,
  +matchLabel?: string,
  +matchName?: string,
  +tests: $ReadOnlyArray<string>
|};

export const command = 'test <tests...>';
export const description = 'Runs tests once. Used for test development.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .env('PALANTIR_TEST')
    .options({
      configuration: {
        description: 'Path to the Palantir monitor configuration file.',
        type: 'string'
      },
      'match-label': {
        description: 'Regex rule used to filter tests by their labels. Labels are normalised to "key=value" values.',
        type: 'string'
      },
      'match-name': {
        description: 'Regex rule used to filter tests by name.',
        type: 'string'
      }
    });
};

// eslint-disable-next-line complexity
export const handler = async (argv: ArgvType) => {
  let isTestNameMatching;

  if (argv.matchName) {
    isTestNameMatching = (testName: string): boolean => {
      return parseRegex(argv.matchName).test(testName);
    };
  }

  let isTestLabelMatching;

  if (argv.matchLabel) {
    isTestLabelMatching = (testLabel: string): boolean => {
      return parseRegex(argv.matchLabel).test(testLabel);
    };
  }

  const log = Logger.child({
    namespace: 'bin/commands/test'
  });

  let configuration = {};

  if (argv.configuration) {
    configuration = importModule(argv.configuration);
  }

  const testFilePaths = resolveFilePathExpression(argv.tests);

  log.debug({
    tests: testFilePaths
  }, 'received %d test file path(s)', testFilePaths.length);

  const monitor = await createMonitor(configuration);

  for (const testFilePath of testFilePaths) {
    const createTestSuite = importModule(testFilePath);

    const testSuite: TestSuiteType = await createTestSuite();

    for (const test of testSuite.tests) {
      if (isTestNameMatching && isTestLabelMatching) {
        const matchingLabels = Object
          .keys(test.labels)
          .map((label) => {
            return label + '=' + test.labels[label];
          })
          .filter(isTestLabelMatching);

        if (!isTestNameMatching(test.name) || !matchingLabels.length) {
          log.debug('skipping test; test name or none of the test labels match the respective filters');

          // eslint-disable-next-line no-continue
          continue;
        }
      } else if (isTestNameMatching) {
        if (!isTestNameMatching(test.name)) {
          log.debug('skipping test; test name does not match the filter');

          // eslint-disable-next-line no-continue
          continue;
        }
      } else if (isTestLabelMatching) {
        const matchingLabels = Object
          .keys(test.labels)
          .map((label) => {
            return label + '=' + test.labels[label];
          })
          .filter(isTestLabelMatching);

        if (!matchingLabels.length) {
          log.debug('skipping test; none of the test labels match the filter');

          // eslint-disable-next-line no-continue
          continue;
        }
      }

      log.debug('running test %s', test.name);

      monitor.runTest(test);
    }
  }
};
