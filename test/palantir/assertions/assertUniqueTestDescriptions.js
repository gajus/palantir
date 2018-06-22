// @flow

import test from 'ava';
import assertUniqueTestDescriptions from '../../../src/assertions/assertUniqueTestDescriptions';

test('does not throw error if all descriptions are unique', (t) => {
  // eslint-disable-next-line flowtype/no-weak-types
  const tests: $ReadOnlyArray<any> = [
    {
      description: 'foo'
    },
    {
      description: 'bar'
    }
  ];

  t.notThrows((): void => {
    assertUniqueTestDescriptions(tests);
  });
});

test('throws error if all descriptions are unique', (t) => {
  // eslint-disable-next-line flowtype/no-weak-types
  const tests: $ReadOnlyArray<any> = [
    {
      description: 'foo'
    },
    {
      description: 'foo'
    }
  ];

  t.throws((): void => {
    assertUniqueTestDescriptions(tests);
  });
});
