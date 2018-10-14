## Specification

### Palantir test

Palantir test is an object with the following properties:

```js
/**
 * @property assert Evaluates user defined script. The result (boolean) indicates if test is passing.
 * @property configuration User defined configuration accessible by the `beforeTest`.
 * @property explain Provides information about an assertion.
 * @property interval A function that describes the time when the test needs to be re-run.
 * @property labels Arbitrary key=value labels used to categorise the tests.
 * @property name Unique name of the test. A combination of test + labels must be unique across all test suites.
 */
type TestType = {|
  +assert: (context: TestContextType) => Promise<boolean>,
  +configuration?: SerializableObjectType,
  +explain?: (context: TestContextType) => Promise<$ReadOnlyArray<SerializableObjectType> | SerializableObjectType>,
  +interval: (consecutiveFailureCount: number) => number,
  +labels: LabelsType,
  +name: string
|};

```

In practice, an example of a test used to check whether HTTP resource is available could look like this:

```js
{
  assert: async () => {
    await request('https://applaudience.com/', {
      timeout: interval('10 seconds')
    });
  },
  interval: () => {
    return interval('30 seconds');
  },
  labels: {
    project: 'applaudience',
    domain: 'http',
    type: 'liveness-check'
  },
  name: 'https://applaudience.com/ responds with 200'
}

```

### Palantir test suite

`monitor` program requires a list of file paths as an input. Every input file must export a function that creates a `TestSuiteType` object:

```js
type TestSuiteType = {|
  +tests: $ReadOnlyArray<TestType>
|};

```

Example:

```js
// @flow

import request from 'axios';
import interval from 'human-interval';
import type {
  TestSuiteFactoryType
} from 'palantir';

const createIntervalCreator = (intervalTime) => {
  return () => {
    return intervalTime;
  };
};

const createTestSuite: TestSuiteFactoryType = () => {
  return {
    tests: [
      {
        assert: async () => {
          await request('https://applaudience.com/', {
            timeout: interval('10 seconds')
          });
        },
        interval: createIntervalCreator(interval('30 seconds')),
        labels: {
          project: 'applaudience',
          scope: 'http'
        },
        name: 'https://applaudience.com/ responds with 200'
      }
    ]
  }
};

export default createTestSuite;

```

Note that the test suite factory may return a promise. Refer to [asynchronously creating a test suite](#asynchronously-creating-a-test-suite) for a use case example.

### Monitor configuration

Palantir `monitor` program accepts `configuration` configuration (a path to a script).

```js
/**
 * @property after Called when shutting down the monitor.
 * @property afterTest Called after every test.
 * @property before Called when starting the monitor.
 * @property beforeTest Called before every test.
 */
type ConfigurationType = {|
  +after: () => Promise<void>,
  +afterTest?: (test: RegisteredTestType, context?: TestContextType) => Promise<void>,
  +before: () => Promise<void>,
  +beforeTest?: (test: RegisteredTestType) => Promise<TestContextType>
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
  afterTest: async (test, context) => {
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
  assert: (context) => {
    return context.connection.any('SELECT 1');
  },
  configuration: {
    database: true
  },
  interval: () => {
    return interval('30 seconds');
  },
  labels: {
    scope: 'database'
  },
  name: 'connects to the database'
}

```

Monitor configuration that is aware of the `configuration.database` configuration.

```js
import {
  createPool
} from 'slonik';

let pool;

export default {
  afterTest: async (test, context) => {
    if (!test.configuration.database) {
      return;
    }

    await context.connection.release();
  },
  before: async () => {
    pool = await createPool('postgres://');
  },
  beforeTest: async (test) => {
    if (!test.configuration.database) {
      return {};
    }

    const connection = await pool.connect();

    return {
      connection
    };
  }
};

```

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
import createTwilio from 'twilio';

const twilio = createTwilio('ACCOUNT SID', 'AUTH TOKEN');

const sendMessage = (message) => {
  twilio.messages.create({
    body: message,
    to: '+12345678901',
    from: '+12345678901'
  });
};

export default {
  onNewFailingTest: (test) => {
    sendMessage('FAILURE ' + test.name + ' failed');
  },
  onRecoveredTest: (test) => {
    sendMessage('RECOVERY ' + test.name + ' recovered');
  }
};

```

The above example will send a message for every failure and recovery, every time failure/ recovery occurs. In practise, it is desired that the alerting system includes a mechanism to filter out temporarily failures. To address this requirement, Palantir implements an [alert controller](#alert-controller).

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
import createTwilio from 'twilio';
import {
  createAlertController
} from 'palantir';

const twilio = createTwilio('ACCOUNT SID', 'AUTH TOKEN');

const sendMessage = (message) => {
  twilio.messages.create({
    body: message,
    to: '+12345678901',
    from: '+12345678901'
  });
};

const controller = createAlertController({
  delayFailure: (test) => {
    if (test.labels.scope === 'database') {
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

### Palantir HTTP API

Palantir `monitor` program creates HTTP GraphQL API server. The API exposes information about the user-registered tests and the failing tests.

Refer to the [schema.graphql](./src/schema.graphql) or [introspect the API](https://graphql.org/learn/introspection/) to learn more.
