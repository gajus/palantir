// @flow

import test from 'ava';
import createLabelCollection from '../../../src/factories/createLabelCollection';

test('converts object to a {key: value} collection', (t) => {
  const collection = createLabelCollection({
    foo: 'bar'
  });

  t.deepEqual(collection, [
    {
      name: 'foo',
      value: 'bar'
    }
  ]);
});

test('sorts collection by label name', (t) => {
  const collection = createLabelCollection({
    foo: 'bar',

    // eslint-disable-next-line sort-keys
    baz: 'qux'
  });

  t.deepEqual(collection, [
    {
      name: 'baz',
      value: 'qux'
    },
    {
      name: 'foo',
      value: 'bar'
    }
  ]);
});
