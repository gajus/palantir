// @flow

import parseRegex from 'regex-parser';
import Logger from '../../Logger';
import {
  createMonitor
} from '../../factories';
import {
  importModule
} from '../../utilities';
import type {
  TestSuiteType
} from '../../types';

type ArgvType = {|
  +configuration?: string,
  +matchDescription?: string,
  +matchTag?: string,
  +tests: $ReadOnlyArray<string>
|};

export const command = 'test <tests...>';
export const description = 'Runs tests once. Used for test development.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      configuration: {
        description: 'Path to the Palantir monitor configuration file.',
        type: 'string'
      },
      'match-description': {
        description: 'Regex rule used to filter tests by description.',
        type: 'string'
      },
      'match-tag': {
        description: 'Regex rule used to filter tests by their tags.',
        type: 'string'
      }
    });
};

// eslint-disable-next-line complexity
export const handler = async (argv: ArgvType) => {
  let isTestDescriptionMatching;

  if (argv.matchDescription) {
    isTestDescriptionMatching = (testDescription: string): boolean => {
      return parseRegex(argv.matchDescription).test(testDescription);
    };
  }

  let isTestTagMatching;

  if (argv.matchTag) {
    isTestTagMatching = (testTag: string): boolean => {
      return parseRegex(argv.matchTag).test(testTag);
    };
  }

  const log = Logger.child({
    namespace: 'bin/commands/test'
  });

  let configuration = {};

  if (argv.configuration) {
    configuration = importModule(argv.configuration);
  }

  log.debug({
    tests: argv.tests
  }, 'received %d test file path(s)', argv.tests.length);

  const monitor = await createMonitor(configuration);

  for (const testFilePath of argv.tests) {
    const createTestSuite = importModule(testFilePath);

    const testSuite: TestSuiteType = await createTestSuite();

    for (const test of testSuite.tests) {
      if (isTestDescriptionMatching && isTestTagMatching) {
        const matchingTags = test.tags.filter(isTestTagMatching);

        if (!isTestDescriptionMatching(test.description) || !matchingTags.length) {
          log.debug('skipping test; test description or none of the test tags match the respective filters');

          // eslint-disable-next-line no-continue
          continue;
        }
      } else if (isTestDescriptionMatching) {
        if (!isTestDescriptionMatching(test.description)) {
          log.debug('skipping test; test description does not match the filter');

          // eslint-disable-next-line no-continue
          continue;
        }
      } else if (isTestTagMatching) {
        const matchingTags = test.tags.filter(isTestTagMatching);

        if (!matchingTags.length) {
          log.debug('skipping test; none of the test tags match the filter');

          // eslint-disable-next-line no-continue
          continue;
        }
      }

      log.debug('running test %s', test.description);

      monitor.runTest(test);
    }
  }
};
