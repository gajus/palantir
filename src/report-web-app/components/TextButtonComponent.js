// @flow

import React from 'react';
import styles from '../main.scss';

type TextButtonComponentPropsType = {|
  +children: string,
  +onClick: () => void
|};

class TextButtonComponent extends React.Component<TextButtonComponentPropsType> {
  handleClick = (event: *) => {
    event.preventDefault();

    this.props.onClick();
  };

  render () {
    return <button
      className={styles.textButton}
      onClick={this.handleClick}
      type='button'
    >
      {this.props.children}
    </button>;
  }
}

export default TextButtonComponent;
