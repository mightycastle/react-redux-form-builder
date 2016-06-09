import React, { Component, PropTypes } from 'react';
import styles from './MultipleChoice.scss';
import MultipleChoiceItem from './MultipleChoiceItem.js';
import _ from 'lodash';

const textOther = 'Other';

class MultipleChoice extends Component {

  constructor(props) {
    super(props);
  }

  static propTypes = {
    isDisabled: PropTypes.bool,
    allowMultiple: PropTypes.bool,
    maxAnswers: PropTypes.number,
    includeOther: PropTypes.bool,
    choices: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    onChange: PropTypes.func,
    onEnterKey: PropTypes.func,
  };

  static defaultProps = {
    isDisabled: false,
    allowMultiple: false,
    maxAnswers: 0,
    includeOther: false,
    choices: [
      {
        text: 'First Selection',
        label: 'A'
      },
      {
        text: 'Second Selection',
        label: 'B'
      }
    ],
    value: {
      text: '',
      label: ''
    },
    onChange: () => {},
    onEnterKey: () => {}
  };

  handleClick = (val) => {
    const { dispatch, allowMultiple, maxAnswers, 
      onChange, onEnterKey, value } = this.props;
    if (typeof onChange !== 'function') return;
    if ( allowMultiple ) {
      var newValue = _.xorWith(value, [val], _.isEqual);
      if ( this.canAcceptChange(newValue) ) {
        onChange(newValue);
      }
    } else {
      onChange(val);
      if (typeof onEnterKey === 'function') {
        setTimeout(onEnterKey, 50);
      }
    }
  }

  canAcceptChange(value) {
    const { maxAnswers } = this.props;
    if ( maxAnswers > 0 && value.length > maxAnswers ) return false;
    return true;
  }

  isMultiSelectable(value) {
    const { maxAnswers } = this.props;
    if ( maxAnswers > 0 && value.length >= maxAnswers ) return false;
    return true;
  }

  isActiveItem(item) {
    var values = this.props.value;
    if (typeof values !== 'object') return false;
    if (values.constructor !== Array) values = [values];
    return typeof _.find(values, {label: item.label}) !== 'undefined';
  }

  render() {
    const { isDisabled, value, choices, allowMultiple, includeOther } = this.props;
    const that = this;
    const isMultiSelectable = that.isMultiSelectable(value);

    var optionals = {};
    if (isDisabled) {
      optionals['disabled'] = 'disabled'
    }

    var choicesList = choices.map((item) => {
      const active = that.isActiveItem(item);
      if (item.label > lastLabel) lastLabel = item.label;

      return <MultipleChoiceItem
        key={item.label}
        label={item.label}
        text={item.text}
        active={active}
        disabled={!active && (allowMultiple && !isMultiSelectable)}
        onClick={that.handleClick}
      />
    });

    if (includeOther) {
      var lastLabel = 'A';
      lastLabel = String.fromCharCode(lastLabel.charCodeAt(0) + choices.length);
      const active = that.isActiveItem({label: lastLabel, text: textOther})
      choicesList.push(
        <MultipleChoiceItem
          key={lastLabel}
          label={lastLabel}
          text={textOther}
          active={active}
          disabled={!active && (allowMultiple && !isMultiSelectable)}
          onClick={that.handleClick}
        />
      )
    }

    return (
      <div className={styles.choicesContainer} {...optionals}>
        <div className={styles.choicesRow}>
          {choicesList}
        </div>
      </div>
    );
  }
}

export default MultipleChoice;
