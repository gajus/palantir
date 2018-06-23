// @flow

import gql from 'graphql-tag';
import delay from 'delay';
import React, {
  Fragment
} from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-boost';
import type {
  RegisteredTestType
} from '../types';
import styles from './main.scss';

type FailingTestComponentPropsType = {|
  +registeredTest: RegisteredTestType
|};

type FailingTestComponentStateType = {|
  queryResultOpen: boolean
|};

const queryFailingTests = async (graphqlClient: ApolloClient): Promise<$ReadOnlyArray<RegisteredTestType>> => {
  // eslint-disable-next-line no-restricted-syntax
  const query = gql`
    {
      failingTests {
        edges {
          node {
            id
            description
            tags
            lastQueryResult
            lastTestedAt
            testIsFailing
          }
        }
      }
    }
  `;

  const result = await graphqlClient.query({
    fetchPolicy: 'no-cache',
    query
  });

  return result.data.failingTests.edges.map((edge) => {
    return edge.node;
  });
};

class FailingTestComponent extends React.Component<FailingTestComponentPropsType, FailingTestComponentStateType> {
  constructor () {
    super();

    this.state = {
      queryResultOpen: false
    };
  }

  handleOpenQueryResult = () => {
    this.setState({
      queryResultOpen: true
    });
  };

  render () {
    const {
      registeredTest
    } = this.props;

    let tagsElement;

    if (registeredTest.tags) {
      const tagElements = registeredTest.tags.map((tag) => {
        return <li key={tag}>
          {tag}
        </li>;
      });

      tagsElement = <Fragment>
        <h2>
          Tags
        </h2>

        <ul className={styles.tags}>
          {tagElements}
        </ul>
      </Fragment>;
    }

    let queryResultElement;

    if (this.state.queryResultOpen) {
      queryResultElement = <div className={styles.queryResult}>
        {JSON.stringify(registeredTest.lastQueryResult, null, '  ')}
      </div>;
    } else {
      queryResultElement = <div className={styles.showQueryResultButton} onClick={this.handleOpenQueryResult}>
        Show last query result
      </div>;
    }

    return <div className={styles.test}>
      <p className={styles.description}>
        {registeredTest.description}
      </p>
      {queryResultElement}
      {tagsElement}
    </div>;
  }
}

const render = (error: ?Error, failingTests: $ReadOnlyArray<RegisteredTestType>) => {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('app element is not present');
  }

  let bodyElement;

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    bodyElement = <div id='error'>
      Unable to load data
    </div>;
  } else if (failingTests.length) {
    const failingTestElements = failingTests.map((registeredTest) => {
      return <li key={registeredTest.id}>
        <FailingTestComponent registeredTest={registeredTest} />
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

  ReactDOM.render(<div id='dashboard'>
    {bodyElement}
  </div>, app);
};

const main = async () => {
  const graphqlClient = new ApolloClient({
    uri: window.PALANTIR.config.API_URL
  });

  while (true) {
    try {
      const failingTests = await queryFailingTests(graphqlClient);

      render(null, failingTests);
    } catch (error) {
      render(error, []);
    }

    // @todo Use GraphQL subscriptions.
    await delay(5000);
  }
};

main();
