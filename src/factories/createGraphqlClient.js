// @flow

import fetch from 'node-fetch';
import {
  ApolloClient
} from 'apollo-client';
import {
  HttpLink
} from 'apollo-link-http';
import {
  InMemoryCache
} from 'apollo-cache-inmemory';

export default (apiUrl: string) => {
  const graphqlClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      credentials: 'include',
      fetch,
      uri: apiUrl
    })
  });

  return graphqlClient;
};
