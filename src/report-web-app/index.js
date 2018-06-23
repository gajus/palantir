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

const render = (failingTests: $ReadOnlyArray<RegisteredTestType>) => {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('app element is not present');
  }

  let bodyElement;

  if (failingTests.length) {
    const failingTestElements = failingTests.map((registeredTest) => {
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

      return <li key={registeredTest.id}>
        <p className={styles.description}>
          {registeredTest.description}
        </p>
        {tagsElement}
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
  render([]);

  const graphqlClient = new ApolloClient({
    uri: window.PALANTIR.config.API_URL
  });

  while (true) {
    const failingTests = await queryFailingTests(graphqlClient);

    render(failingTests);

    // @todo Use GraphQL subscriptions.
    await delay(5000);
  }
};

main();
