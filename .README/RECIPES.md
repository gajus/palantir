## Recipes

### Asynchronously creating a test suite

Creating a test suite might require to query an asynchronous source, e.g. when information required to create a test suite is stored in a database. In this case, a test suite factory can return a promise that resolves with a test suite, e.g.

```js
const createTestSuite: TestSuiteFactoryType = async () => {
  const clients = await getClients(connection);

  return clients.map((client) => {
    return {
      assert: async () => {
        await request(client.url, {
          timeout: interval('10 seconds')
        });
      },
      interval: createIntervalCreator(interval('30 seconds')),
      labels: {
        'client.country': client.country,
        'client.id': client.id,
        source: 'http',
        type: 'liveness-check'
      },
      name: client.url + ' responds with 200'
    };
  });
};

```

In the above example, `getClients` is used to asynchronously retrieve information required to construct the test suite.

### Refreshing a test suit

It might be desired that the test suite itself informs the monitor about new tests, e.g. the example in the [asynchronously creating a test suite](#asynchronously-creating-a-test-suite) recipe retrieves information from an external datasource that may change over time. In this case, a test suite factory can inform the `monitor` program that it should recreate the test suite, e.g.

```js
const createTestSuite: TestSuiteFactoryType = async (refreshTestSuite) => {
  const clients = await getClients(connection);

  (async () => {
    // Some logic used to determine when the `clients` data used
    // to construct the original test suite becomes stale.
    while (true) {
      await delay(interval('10 seconds'));

      if (JSON.stringify(clients) !== JSON.stringify(await getClients(connection))) {
        // Calling `refreshTestSuite` will make Palantir monitor program
        // recreate the test suite using `createTestSuite`.
        refreshTestSuite();

        break;
      }
    }
  })();

  return clients.map((client) => {
    return {
      assert: async () => {
        await request(client.url, {
          timeout: interval('10 seconds')
        });
      },
      interval: createIntervalCreator(interval('30 seconds')),
      labels: {
        'client.country': client.country,
        'client.id': client.id,
        source: 'http',
        type: 'liveness-check'
      },
      name: client.url + ' responds with 200'
    };
  });
};

```
