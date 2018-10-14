// @flow

import test from 'ava';
import assertUniqueTestIdPayloads from '../../../src/assertions/assertUniqueTestIdPayloads';

test('does not throw error if all descriptions are unique', (t) => {
  const tests = [
    {
      labels: {},
      name: 'foo'
    },
    {
      labels: {},
      name: 'bar'
    }
  ];

  t.notThrows((): void => {
    assertUniqueTestIdPayloads(tests);
  });
});

test('throws error if not all descriptions are unique', (t) => {
  const tests = [
    {
      labels: {},
      name: 'foo'
    },
    {
      labels: {},
      name: 'foo'
    }
  ];

  t.throws((): void => {
    assertUniqueTestIdPayloads(tests);
  });
});
