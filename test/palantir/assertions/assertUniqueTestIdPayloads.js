// @flow

import test from 'ava';
import assertUniqueTestIdPayloads from '../../../src/assertions/assertUniqueTestIdPayloads';

test('does not throw error if all descriptions are unique', (t) => {
  const tests = [
    {
      description: 'foo',
      tags: []
    },
    {
      description: 'bar',
      tags: []
    }
  ];

  t.notThrows((): void => {
    assertUniqueTestIdPayloads(tests);
  });
});

test('throws error if not all descriptions are unique', (t) => {
  const tests = [
    {
      description: 'foo',
      tags: []
    },
    {
      description: 'foo',
      tags: []
    }
  ];

  t.throws((): void => {
    assertUniqueTestIdPayloads(tests);
  });
});
