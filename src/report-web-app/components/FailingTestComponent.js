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

    return <article className={styles.test}>
      <dl className={styles.name}>
        <dt>
          Failing test
        </dt>
        <dd>
          {registeredTest.name}
        </dd>
      </dl>

      {labelsElement}
      {navigationElement}
    </article>;
  }
}

export default FailingTestComponent;
