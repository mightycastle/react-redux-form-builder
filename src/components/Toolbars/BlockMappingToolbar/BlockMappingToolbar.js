import React, {
  Component,
  PropTypes
} from 'react';
import _ from 'lodash';
import AppButton from 'components/Buttons/AppButton';
import Switch from 'rc-switch';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { MdInfo, MdCheck } from 'react-icons/lib/md';
import { GoTrashcan } from 'react-icons/lib/go';
import MappingToolbarLayout, {
  ToolbarCol,
  ToolbarRow
} from '../MappingToolbarLayout';
import Label from '../Label';
import SpinEdit from '../SpinEdit';
import styles from './BlockMappingToolbar.scss';

const arrangePopover = (
  <Popover id="blockMappingToolbarArrangePopover">
    TODO: Add arange popover here.
  </Popover>
);

export default class BlockMappingToolbar extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    placement: PropTypes.oneOf(['top', 'bottom']),
    offset: PropTypes.number,
    values: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      values: props.values
    };
  }

  componentWillReceiveProps(nextProps) {
    const { values } = nextProps;
    this.setState({ values });
  }

  handleBlocksChange = (value) => {

  }

  handleFontSizeChange = (value) => {

  }

  handleWidthChange = (value) => {
    this.setState({
      values: _.assign({}, this.state.values, { width: value })
    });
  }

  handleHeightChange = (value) => {
    this.setState({
      values: _.assign({}, this.state.values, { height: value })
    });
  }

  handleSaveClick = () => {
    const { onChange } = this.props;
    onChange(this.state.values);
  }

  render() {
    const { offset, placement } = this.props;
    const { values: { width, height, blocks, fontSize } } = this.state;
    return (
      <MappingToolbarLayout placement={placement} offset={offset}>
        <ToolbarRow>
          <ToolbarCol className={styles.halfCol}>
            <Label className={styles.label}>Blocks:</Label>
            <SpinEdit value={blocks} onChange={this.handleBlocksChange} />
          </ToolbarCol>
          <ToolbarCol className={styles.halfCol}>
            <Label className={styles.label}>Font:</Label>
            <SpinEdit value={fontSize} onChange={this.handleFontSizeChange} />
          </ToolbarCol>
        </ToolbarRow>
        <ToolbarRow>
          <ToolbarCol className={styles.halfCol}>
            <Label className={styles.label}>Width:</Label>
            <SpinEdit value={width} onChange={this.handleWidthChange} />
          </ToolbarCol>
          <ToolbarCol className={styles.halfCol}>
            <Label className={styles.label}>Height:</Label>
            <SpinEdit value={height} onChange={this.handleHeightChange} />
          </ToolbarCol>
        </ToolbarRow>
        <ToolbarRow>
          <ToolbarCol className={styles.halfCol}>
            <Label>
              Arrange:{' '}
              <OverlayTrigger trigger={['focus', 'hover']} placement="top" overlay={arrangePopover}>
                <span className={styles.popoverIcon} tabIndex={0}>
                  <MdInfo size={16} />
                </span>
              </OverlayTrigger>
            </Label>
            <div className="pull-right">
              <Switch />
            </div>
          </ToolbarCol>
          <ToolbarCol className={`${styles.halfCol} text-right`}>
            <Button className={styles.removeButton}><GoTrashcan size={18} /></Button>
            <AppButton size="sm" extraClass={styles.saveButton} onClick={this.handleSaveClick}>
              <MdCheck size={16} />
            </AppButton>
          </ToolbarCol>
        </ToolbarRow>
      </MappingToolbarLayout>
    );
  }
}
