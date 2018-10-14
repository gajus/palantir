// @flow

import delay from 'delay';
import React from 'react';
// eslint-disable-next-line import/no-named-as-default
import ApolloClient from 'apollo-boost';
import {
  hot
} from 'react-hot-loader';
import styles from '../main.scss';
import {
  getFailingRegisteredTests,
  getRegisteredTestById
} from '../services';
import FailingTestComponent from '../components/FailingTestComponent';
import type {
  FailingTestType,
  SubjectTestType
} from '../types';
import {
  API_URL
} from '../config';

type RootStateType = {|
  +failingRegisteredTests: $ReadOnlyArray<FailingTestType>,
  +failingRegisteredTestsError: Error | null,
  +failingRegisteredTestsIsLoaded: boolean,
  +subjectTest: SubjectTestType | null,
  +subjectTestError: Error | null,
  +subjectTestIsLoading: boolean
|};

const graphqlClient = new ApolloClient({
  uri: API_URL
});

const pool = async (update) => {
  while (true) {
    try {
      const failingRegisteredTests = await getFailingRegisteredTests(graphqlClient);

      update(null, failingRegisteredTests);
    } catch (error) {
      update(error, []);
    }

    // @todo Use GraphQL subscriptions.
    await delay(5000);
  }
};

class Root extends React.Component<void, RootStateType> {
  constructor () {
    super();

    this.state = {
      failingRegisteredTests: [],
      failingRegisteredTestsError: null,
      failingRegisteredTestsIsLoaded: false,
      subjectTest: null,
      subjectTestError: null,
      subjectTestIsLoading: false
    };

    pool((error, failingRegisteredTests) => {
      this.setState((currentState) => {
        return {
          ...currentState,
          failingRegisteredTests: failingRegisteredTests || [],
          failingRegisteredTestsError: error || null,
          failingRegisteredTestsIsLoaded: true
        };
      });
    });
  }

  handleExplainRegisteredTest = (registeredTestId: string) => {
    this.setState({
      subjectTestIsLoading: true
    });

    (async () => {
      try {
        const subjectTest = await getRegisteredTestById(graphqlClient, registeredTestId);

        // eslint-disable-next-line no-console
        console.info('subjectTest', subjectTest);

        this.setState({
          subjectTest,
          subjectTestError: null,
          subjectTestIsLoading: false
        });
      } catch (error) {
        this.setState({
          subjectTest: null,
          subjectTestError: error,
          subjectTestIsLoading: false
        });
      }
    })();
  };

  render () {
    const {
      failingRegisteredTests,
      failingRegisteredTestsError,
      failingRegisteredTestsIsLoaded,
      subjectTest,
      subjectTestError,
      subjectTestIsLoading
    } = this.state;

    let bodyElement;

    if (!failingRegisteredTestsIsLoaded) {
      bodyElement = <div className={styles.activityMessage}>
        Loading the failing test cases.
      </div>;
    } else if (failingRegisteredTestsError) {
      bodyElement = <div className={styles.errorMessage}>
        Unable to load the failing test cases.
      </div>;
    } else if (failingRegisteredTests.length) {
      const failingTestElements = failingRegisteredTests
        .slice(0)
        .sort((a, b) => {
          return a.priority - b.priority;
        })
        .map((registeredTest) => {
          return <li key={registeredTest.id}>
            <FailingTestComponent
              onExplainRegisteredTest={this.handleExplainRegisteredTest}
              registeredTest={registeredTest}
            />
          </li>;
        });

      bodyElement = <ul className={styles.tests}>
        {failingTestElements}
      </ul>;
    } else {
      bodyElement = <div className={styles.allTestsPassingMessage}>
        <p>
          All tests are passing.
        </p>
      </div>;
    }

    let testPanelElement;

    if (subjectTestError) {
      testPanelElement = <div className={styles.testPanel}>
        <div className={styles.message}>
          {subjectTestError.message}
        </div>
      </div>;
    } else if (subjectTestIsLoading) {
      testPanelElement = <div className={styles.testPanel}>
        <div className={styles.message}>
          Loading...
        </div>
      </div>;
    } else if (subjectTest) {
      testPanelElement = <div className={styles.testPanel}>
        <div className={styles.explain}>
          {JSON.stringify(subjectTest.explain, null, 2)}
        </div>
      </div>;
    } else {
      testPanelElement = <div className={styles.testPanel}>
        <div className={styles.message}>
          Select a test.
        </div>
      </div>;
    }

    return <div id='dashboard'>
      {bodyElement}
      {testPanelElement}
    </div>;
  }
}

export default hot(module)(Root);
