// @flow

import gql from 'graphql-tag';
// eslint-disable-next-line import/no-named-as-default
import ApolloClient from 'apollo-boost';
import {
  createLabelsObject
} from './factories';
import type {
  FailingTestType,
  SubjectTestType
} from './types';

export const getFailingRegisteredTests = async (graphqlClient: ApolloClient): Promise<$ReadOnlyArray<FailingTestType>> => {
  // eslint-disable-next-line no-restricted-syntax
  const query = gql`
    {
      failingRegisteredTests {
        edges {
          node {
            id
            name
            explainIsAvailable
            labels {
              name
              value
            }
            lastError {
              message
              name
              stack
            }
            lastTestedAt
            priority
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

  return result.data.failingRegisteredTests.edges.map((edge) => {
    return {
      ...edge.node,
      labels: createLabelsObject(edge.node.labels)
    };
  });
};

export const getRegisteredTestById = async (graphqlClient: ApolloClient, registeredTestId: string): Promise<SubjectTestType> => {
  // eslint-disable-next-line no-restricted-syntax
  const query = gql`
    query getRegisteredTestById (
      $registeredTestId: ID!
    ) {
      getRegisteredTestById (
        registeredTestId: $registeredTestId
      ) {
        id
        name
        explain
      }
    }
  `;

  const result = await graphqlClient.query({
    fetchPolicy: 'no-cache',
    query,
    variables: {
      registeredTestId
    }
  });

  return result.data.getRegisteredTestById;
};
