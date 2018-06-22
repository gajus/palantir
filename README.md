<a name="palantir"></a>
# Palantir

[![Travis build status](http://img.shields.io/travis/gajus/palantir/master.svg?style=flat-square)](https://travis-ci.org/gajus/palantir)
[![Coveralls](https://img.shields.io/coveralls/gajus/palantir.svg?style=flat-square)](https://coveralls.io/github/gajus/palantir)
[![NPM version](http://img.shields.io/npm/v/palantir.svg?style=flat-square)](https://www.npmjs.org/package/palantir)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Active monitoring and alerting system using user-defined Node.js scripts.

* [Palantir](#palantir)
    * [Motivation](#palantir-motivation)
    * [Usage](#palantir-usage)
        * [`monitor` program](#palantir-usage-monitor-program)
        * [`alert` program](#palantir-usage-alert-program)
        * [`report` program](#palantir-usage-report-program)
    * [Specification](#palantir-specification)
        * [Palantir test](#palantir-specification-palantir-test)
        * [Monitor configuration](#palantir-specification-monitor-configuration)
        * [Alert configuration](#palantir-specification-alert-configuration)
        * [Alert controller](#palantir-specification-alert-controller)
        * [Palantir HTTP API](#palantir-specification-palantir-http-api)


<a name="palantir-motivation"></a>
## Motivation

Existing monitoring software primarily focuses on enabling visual inspection of service health metrics and relies on service maintainers to detect anomalies. This approach is time consuming and allows for human-error. Even when monitoring systems allow to define alerts based on pre-defined thresholds, a point-in-time metric is not sufficient to determine service-health. The only way to establish service-health is to write thorough integration tests (scripts) and automate their execution, just like we do in software-development.

Palantir is continuously performs user-defined tests and only reports failing tests, i.e. if everything is working as expected, the system remains silent. This allows service developers/maintainers to focus on defining tests that provide early warnings about the errors that are about to occur and take preventative actions when alerts occur.

Palantir decouples monitoring, alerting and reporting mechanisms. This method allows distributed monitoring and role-based, tag-based alerting system architecture.

<a name="palantir-usage"></a>
## Usage

<a name="palantir-usage-monitor-program"></a>
### <code>monitor</code> program

`monitor` program continuously performs user-defined tests and exposes the current state via [Palantir HTTP API](#palantir-http-api).

```bash
$ palantir monitor --service-port 8080 --configuration ./monitor-configuration.js ./tests/**/*

```

Every test file must export an array of Palantir tests.

* Refer to [Palantir test](#palantir-test) specification.
* Refer to [Monitor configuration](#monitor-configuration) specification.

<a name="palantir-usage-alert-program"></a>
### <code>alert</code> program

`alert` program subscribes to [Palantir HTTP API](#palantir-http-api) and alerts other systems using user-defined configuration.

```bash
$ palantir alert --configuration ./alert-configuration.js --palantir-api-url http://127.0.0.1:8080/

```

* Refer to [Alert configuration](#alert-configuration) specification.

<a name="palantir-usage-report-program"></a>
### <code>report</code> program

`report` program creates a web UI for the [Palantir HTTP API](#palantir-http-api).

```bash
$ palantir report --service-port 8081 --palantir-api-url http://127.0.0.1:8080/

```

<a name="palantir-specification"></a>
## Specification

<a name="palantir-specification-palantir-test"></a>
### Palantir test

Palantir test is an object with the following properties:

```js
type TestContextType = Object;

type QueryResultType = *;

type TestConfigurationType = Object;

/**
 * @property configuration Test-specific configuration passed to `beforeTest` and `afterTest` as the first parameter.
 * @property description Test description.
 * @property interval Returns an interval (in milliseconds) at which the test should be executed.
 * @property tags An array of tags used for organisation of tests.
 * @property query Method used to query the data. If method execution results in an error, the test fails.
 * @property assert Method used to evaluate the response of query. If method returns `false`, the test fails.
 */
type TestType = {|
  +configuration?: TestConfigurationType,
  +description: string,
  +interval: (consecutiveFailureCount: number) => number,
  +tags: $ReadOnlyArray<string>,
  +query: (context: TestContextType) => Promise<QueryResultType>,
  +assert?: (queryResult: QueryResultType) => boolean
|};

```

In practice, an example of a test used to check whether HTTP resource is available could look like this:

```js
// This example uses `interval` and `axios` NPM packages.

{
  description: 'https://go2cinema.com/ responds with 200',
  interval: () => {
    return interval('30 seconds');
  },
  query: async () => {
    await axios('https://go2cinema.com/', {
      timeout: interval('10 seconds')
    });
  },
  tags: [
    'go2cinema'
  ]
}

```

Notice that the `assert` method is optional. If `query` method evaluates without an error and `assert` method is not defined, then the test is considered to be passing.

<a name="palantir-specification-monitor-configuration"></a>
### Monitor configuration

Palantir monitor program accepts `configuration` configuration (a path to a script).

```js
/**
 * @property after Called when shutting down the monitor.
 * @property afterTest Called after every test.
 * @property before Called when starting the monitor.
 * @property beforeTest Called before every test.
 */
type ConfigurationType = {|
  +after: () => Promise<void>,
  +afterTest?: (configuration?: TestConfigurationType, context?: TestContextType) => Promise<void>,
  +before: () => Promise<void>,
  +beforeTest?: (configuration?: TestConfigurationType) => Promise<TestContextType>
|};

```

The configuration script allows to setup hooks for different stages of the program execution.

In practice, this can be used to configure the database connection, e.g.

```js
import {
  createPool
} from 'slonik';

let pool;

export default {
  afterTest: async (configuration, context) => {
    await context.connection.release();
  },
  before: async () => {
    pool = await createPool('postgres://');
  },
  beforeTest: async () => {
    const connection = await pool.connect();

    return {
      connection
    };
  }
};

```

Note that in the above example, unless you are using database connection for all the tests, you do not want to allocate a connection for every test. You can restrict allocation of connection using test configuration, e.g.

Test that requires connection to the database:

```js
{
  configuration: {
    database: true
  },
  description: 'connects to the database',
  interval: () => {
    return interval('30 seconds');
  },
  query: (context) => {
    return context.connection.any('SELECT 1');
  },
  tags: [
    'database'
  ]
}

```

Monitor configuration that is aware of the `configuration.database` configuration.

```js
import {
  createPool
} from 'slonik';

let pool;

export default {
  afterTest: async (configuration, context) => {
    if (!configuration.database) {
      return;
    }

    await context.connection.release();
  },
  before: async () => {
    pool = await createPool('postgres://');
  },
  beforeTest: async (configuration) => {
    if (!configuration.database) {
      return {};
    }

    const connection = await pool.connect();

    return {
      connection
    };
  }
};

```

<a name="palantir-specification-alert-configuration"></a>
### Alert configuration

Palantir `alert` program accepts `configuration` configuration (a path to a script).

```js
/**
 * @property onNewFailingTest Called when a new test fails.
 * @property onRecoveredTest Called when a previously failing test is no longer failing.
 */
type AlertConfigurationType = {|
  +onNewFailingTest?: (registeredTest: RegisteredTestType) => void,
  +onRecoveredTest?: (registeredTest: RegisteredTestType) => void
|};

```

The alert configuration script allows to setup event handlers used to observe when tests fail and recover.

In practice, this can be used to configure a system that notifies other systems about the failing tests, e.g.

```js
/**
 * @file Using https://www.twilio.com/ to send a text message when tests fail and when tests recover.
 */
import Twilio from 'twilio';

const twilio = new Twilio('ACCOUNT SID', 'AUTH TOKEN');

const sendMessage = (message) => {
  client.messages.create({
    body: message,
    to: '+12345678901',
    from: '+12345678901'
  });
};

export default {
  onNewFailingTest: (test) => {
    sendMessage('FAILURE ' + test.description + ' failed');
  },
  onRecoveredTest: (test) => {
    sendMessage('RECOVERY ' + test.description + ' recovered');
  }
};

```

The above example will send a message for every failure and recovery, every time failure/ recovery occurs. In practise, it is desired that the alerting system includes a mechanism to filter out temporarily failures. To address this requirement, Palantir implements an [alert controller](#alert-controller).

<a name="palantir-specification-alert-controller"></a>
### Alert controller

Palantir alert controller abstracts logic used to filter temporarily failures.

`palantir` module exports a factory method `createAlertController` used to create an Palantir alert controller.

```js
/**
 * @property delayFailure Returns test-specific number of milliseconds to wait before considering the test to be failing.
 * @property delayRecovery Returns test-specific number of milliseconds to wait before considering the test to be recovered.
 * @property onFailure Called when test is considered to be failing.
 * @property onRecovery Called when test is considered to be recovered.
 */
type ConfigurationType = {|
  +delayFailure: (test: RegisteredTestType) => number,
  +delayRecovery: (test: RegisteredTestType) => number,
  +onFailure: (test: RegisteredTestType) => void,
  +onRecovery: (test: RegisteredTestType) => void
|};

type AlertControllerType = {|
  +getDelayedFailingTests: () => $ReadOnlyArray<RegisteredTestType>,
  +getDelayedRecoveringTests: () => $ReadOnlyArray<RegisteredTestType>,
  +registerTestFailure: (test: RegisteredTestType) => void,
  +registerTestRecovery: (test: RegisteredTestType) => void
|};

createAlertController(configuration: ConfigurationType) => AlertControllerType;

```

Use `createAlertController` to implement alert throttling, e.g.

```js
import interval from 'human-interval';
import Twilio from 'twilio';
import {
  createAlertController
} from 'palantir';

const twilio = new Twilio('ACCOUNT SID', 'AUTH TOKEN');

const sendMessage = (message) => {
  client.messages.create({
    body: message,
    to: '+12345678901',
    from: '+12345678901'
  });
};

const controller = createAlertController({
  delayFailure: (test) => {
    if (test.tags.includes('database')) {
      return 0;
    }

    return interval('5 minute');
  },
  delayRecovery: () => {
    return interval('1 minute');
  },
  onFailure: (test) => {
    sendMessage('FAILURE ' + test.description + ' failed');
  },
  onRecovery: () => {
    sendMessage('RECOVERY ' + test.description + ' recovered');
  }
});

export default {
  onNewFailingTest: (test) => {
    controller.registerTestFailure(test);
  },
  onRecoveredTest: (test) => {
    controller.registerTestRecovery(test);
  }
};

```

<a name="palantir-specification-palantir-http-api"></a>
### Palantir HTTP API

Palantir `monitor` program creates HTTP GraphQL API server. The API exposes information about the user-registered tests and the failing tests.

Refer to the [schema.graphql](./src/schema.graphql) or [introspect the API](https://graphql.org/learn/introspection/) to learn more.
