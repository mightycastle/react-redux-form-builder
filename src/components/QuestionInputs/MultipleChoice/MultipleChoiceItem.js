import React, { Component, PropTypes} from 'react';
import styles from './MultipleChoice.scss';
import classNames from 'classnames';

class MultipleChoiceItem extends Component {

  static contextTypes = {
    primaryColour: React.PropTypes.string
  };

  static propTypes = {
    label: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired
  };

  static defaultProps = {
    active: false
  };

  handleClick = () => {
    const { onClick, label, text } = this.props;
    onClick({ label, text });
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      this.handleClick();
    }
  }

  render() {
    const { label, text, active, disabled } = this.props;
    const { primaryColour } = this.context;

    const choiceItemClasses = classNames({
      [styles.choiceItem]: true,
      [styles.active]: active,
      [styles.disabled]: disabled
    });

    var optionals = {};
    if (active) {
      optionals['style'] = {
        borderColor: primaryColour
      };
    }
    if (!disabled) {
      optionals['onClick'] = this.handleClick;
      optionals['onKeyDown'] = this.handleKeyDown;
    }

    return (
      <div ref="divForMultipleChoiceItem" className={choiceItemClasses} tabIndex={0} {...optionals}>
        <label className={styles.label}>{label}</label>
        <span className={styles.text}>{text}</span>
      </div>
    );
  }
}

export default MultipleChoiceItem;
