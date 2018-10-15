// @flow

import React from 'react';
import styles from '../main.scss';

type TestFilterPropsType = {|
  +filterExpressionError: Error | null,
  +onFilterExpressionChange: (filterExpression: string) => void
|};

class TestFilter extends React.Component<TestFilterPropsType> {
  render () {
    let filterErrorElement;

    if (this.props.filterExpressionError) {
      filterErrorElement = <div className={styles.errorMessage}>
        {this.props.filterExpressionError.message}
      </div>;
    }

    return <div className={styles.testFilter}>
      <input
        onChange={(event) => {
          this.props.onFilterExpressionChange(event.target.value);
        }}
        placeholder='Failing test filter'
        type='text'
      />
      <div className={styles.instructions}>
        <p>Failing tests can be filtered using <a href='https://docs.mongodb.com/manual/reference/operator/' target='_blank'>MongoDB query expressions</a>.</p>
      </div>
      {filterErrorElement}
    </div>;
  }
}

export default TestFilter;
