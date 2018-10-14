// @flow

/* eslint-disable import/exports-last */

// eslint-disable-next-line no-use-before-define
type SerializableObjectValueType = string | number | boolean | SerializableObjectType | $ReadOnlyArray<SerializableObjectValueType>;

export type SerializableObjectType = {
  +[key: string]: SerializableObjectValueType
};

// eslint-disable-next-line flowtype/no-weak-types
type TestContextType = Object;

export type TestSubjectType = SerializableObjectValueType;

export type LabelsType = {
  +[key: string]: string
};

type LabelPairType = {|
  +name: string,
  +value: string
|};

export type LabelCollectionType = $ReadOnlyArray<LabelPairType>;

/**
 * @property assert Evaluates user defined script. The result (boolean) indicates if test is passing.
 * @property configuration User defined configuration accessible by the `beforeTest`.
 * @property explain Provides information about an assertion.
 * @property interval A function that describes the time when the test needs to be re-run.
 * @property labels Arbitrary key=value labels used to categorise the tests.
 * @property name Unique name of the test. A combination of test + labels must be unique across all test suites.
 */
export type TestType = {|
  +assert: (context: TestContextType) => Promise<boolean>,
  +configuration?: SerializableObjectType,
  +explain?: (context: TestContextType) => Promise<$ReadOnlyArray<SerializableObjectType> | SerializableObjectType>,
  +interval: (consecutiveFailureCount: number) => number,
  +labels: LabelsType,
  +name: string
|};

export type TestIdPayloadInputType = {
  +labels: LabelsType,
  +name: string
};

export type TestSuiteType = {|
  +tests: $ReadOnlyArray<TestType>
|};

export type TestSuiteFactoryType = (refreshTestSuite: () => void) => Promise<TestSuiteType> | TestSuiteType;

type NormalizedErrorType = {|
  +message: string,
  +name: string,
  +stack: string
|};

export type TestExecutionType = {|
  +error: NormalizedErrorType | null,
  +executedAt: number,
  +testIsFailing: boolean
|};

export type RegisteredTestType = {|
  +id: string,
  ...TestType,
  consecutiveFailureCount: number | null,
  lastError: NormalizedErrorType | null,
  lastTestedAt: number | null,
  testIsFailing: boolean | null
|};

export type AlertConfigurationType = {|
  +onNewFailingTest?: (registeredTest: RegisteredTestType) => void,
  +onRecoveredTest?: (registeredTest: RegisteredTestType) => void
|};

/**
 * @property beforeTest Creates test execution context.
 */
export type MonitorConfigurationType = {|
  +after?: () => Promise<void> | void,
  +afterTest?: (test?: RegisteredTestType, context?: TestContextType) => Promise<void> | void,
  +before?: () => Promise<void> | void,
  +beforeTest?: (test?: RegisteredTestType) => Promise<TestContextType> | TestContextType
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
