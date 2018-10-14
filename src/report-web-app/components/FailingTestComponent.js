// @flow

import React from 'react';
import styles from '../main.scss';
import type {
  FailingTestType
} from '../types';
import TextButtonComponent from './TextButtonComponent';

type FailingTestComponentPropsType = {|
  +registeredTest: FailingTestType,
  +onExplainRegisteredTest: (registeredTestId: string) => void
|};

class FailingTestComponent extends React.Component<FailingTestComponentPropsType> {
  render () {
    const {
      registeredTest,
      onExplainRegisteredTest
    } = this.props;

    const tagElements = registeredTest.labels.map((label) => {
      return <li key={label.name}>
        <dl>
          <dt>
            {label.name}
          </dt>
          <dd>
            {label.value}
          </dd>
        </dl>
      </li>;
    });

    const labelsElement = <aside className={styles.labels}>
      <h1>
        Labels
      </h1>

      <ul className={styles.labels}>
        {tagElements}
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
