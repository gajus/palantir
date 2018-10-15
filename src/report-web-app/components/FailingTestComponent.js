// @flow

import React from 'react';
import styles from '../main.scss';
import type {
  FailingTestType
} from '../types';
import TextButtonComponent from './TextButtonComponent';

type FailingTestComponentPropsType = {|
  +onExplainRegisteredTest: (registeredTestId: string) => void,
  +onFilterExpressionChange: (filterExpression: string) => void,
  +registeredTest: FailingTestType
|};

class FailingTestComponent extends React.Component<FailingTestComponentPropsType> {
  render () {
    const {
      onExplainRegisteredTest,
      onFilterExpressionChange,
      registeredTest
    } = this.props;

    const labelElements = Object.keys(registeredTest.labels).map((labelName) => {
      return <li
        key={labelName}
        onClick={() => {
          onFilterExpressionChange(JSON.stringify({
            labels: {
              [labelName]: {
                // eslint-disable-next-line id-match
                $eq: registeredTest.labels[labelName]
              }
            }
          }));
        }}
      >
        <dl>
          <dt>
            {labelName}
          </dt>
          <dd>
            {registeredTest.labels[labelName]}
          </dd>
        </dl>
      </li>;
    });

    const labelsElement = <aside className={styles.labels}>
      <h1>
        Labels
      </h1>

      <ul className={styles.labels}>
        {labelElements}
      </ul>
    </aside>;

    let navigationElement;

    if (registeredTest.explainIsAvailable) {
      navigationElement = <div className={styles.navigation}>
        <TextButtonComponent
          onClick={() => {
            onExplainRegisteredTest(registeredTest.id);
          }}
        >
          Explain
        </TextButtonComponent>
      </div>;
    }

    let errorElement;

    if (registeredTest.lastError) {
      errorElement = <aside className={styles.error}>
        <h1>
          {registeredTest.lastError.name}
        </h1>
        <p>
          {registeredTest.lastError.message}
        </p>
        <div className={styles.stack}>
          {registeredTest.lastError.stack}
        </div>
      </aside>;
    }

    return <article className={styles.failingTest}>
      <dl className={styles.name}>
        <dt>
          Failing test
        </dt>
        <dd>
          {registeredTest.name}
        </dd>
      </dl>
      <dl className={styles.name}>
        <dt>
          Priority
        </dt>
        <dd>
          {registeredTest.priority}
        </dd>
      </dl>
      {labelsElement}
      {errorElement}
      {navigationElement}
    </article>;
  }
}

export default FailingTestComponent;
