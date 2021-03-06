import React, {
  Component,
  PropTypes
} from 'react';
import styles from './ColorPicker.scss';
import classNames from 'classnames';
import { CompactPicker, GithubPicker } from 'react-color';
import { FaAngleDown } from 'react-icons/lib/fa';

class ColorPicker extends Component {

  static propTypes = {
    value: PropTypes.string,
    type: PropTypes.oneOf(['compact', 'block', 'github']),
    onChange: PropTypes.func,
    /*
    customSwatches - limits the picker to specific colours
    eg.: ['#3993d1', '#2c3744', '#fff', '#000']
    */
    customSwatches: PropTypes.array,
    buttonClassName: PropTypes.string
  };

  static defaultProps = {
    value: '#000000',
    customSwatches: ['#3993d1', '#1c6fa6', '#073660', '#ff8a00', '#eceff2', '#f0f4f7'],
    type: 'compact'
  };

  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false
    };
  }

  togglePicker = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  closePicker = () => {
    this.setState({ displayColorPicker: false });
  };

  handleColorChange = (color) => {
    this.props.onChange(color.hex);
  }

  render() {
    let colorDisplay = {
      'background': this.props.value
    };
    const { buttonClassName, value, customSwatches, type } = this.props;
    const props = {
      color: value,
      onChangeComplete: this.handleColorChange,
      colors: customSwatches
    };
    return (
      <div className={styles.colorButtonWrapper}>
        <button type="button" onClick={this.togglePicker}
          className={classNames(styles.colorPickerButton, {[buttonClassName]: buttonClassName})}>
          <span className={styles.colorBox} style={colorDisplay} /> <FaAngleDown />
        </button>
        { this.state.displayColorPicker ? <div className={styles.colorPickerWrapper}>
          <div className={styles.cover} onClick={this.closePicker} />
          {
            type === 'compact'? <CompactPicker {...props} /> : <GithubPicker {...props} />
          }
        </div> : null }
      </div>
    );
  }
}

export default ColorPicker;
