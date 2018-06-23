// @flow

/* eslint-disable import/exports-last */

type SerializableObjectType = {
  +[key: string]: string | number | boolean | $ReadOnlyArray<SerializableObjectType> | SerializableObjectType
};

// eslint-disable-next-line flowtype/no-weak-types
type TestContextType = Object;

export type QueryResultType = ?SerializableObjectType;

// eslint-disable-next-line flowtype/no-weak-types
type TestConfigurationType = Object;

export type TestType = {|
  +configuration?: TestConfigurationType,
  +description: string,
  +interval: (consecutiveFailureCount: number) => number,
  +tags: $ReadOnlyArray<string>,
  +query: (context: TestContextType) => Promise<QueryResultType>,
  +assert?: (queryResult: QueryResultType) => boolean
|};

export type TestSuiteType = {|
  +tests: $ReadOnlyArray<TestType>
|};

export type TestSuiteFactoryType = (refreshTestSuite: () => void) => Promise<TestSuiteType> | TestSuiteType;

export type RegisteredTestType = {|
  +id: string,
  consecutiveFailureCount: number | null,
  lastQueryResult: QueryResultType,
  lastTestedAt: number | null,
  testIsFailing: boolean | null,
  ...TestType
|};

export type AlertConfigurationType = {|
  +onNewFailingTest?: (registeredTest: RegisteredTestType) => void,
  +onRecoveredTest?: (registeredTest: RegisteredTestType) => void
|};

export type MonitorConfigurationType = {|
  +after?: () => Promise<void>,
  +afterTest?: (test?: RegisteredTestType, context?: TestContextType) => Promise<void>,
  +before?: () => Promise<void>,
  +beforeTest?: (test?: RegisteredTestType) => Promise<TestContextType>
|};

type MonitorType = {|
  +getRegisteredTests: () => $ReadOnlyArray<RegisteredTestType>
|};

export type ResolverContextType = {|
  monitor: MonitorType
|};

export type ResolverType<T, P: * = Object> = {
  +[key: string]: (parent: T, parameters: P, context: ResolverContextType) => *
};
