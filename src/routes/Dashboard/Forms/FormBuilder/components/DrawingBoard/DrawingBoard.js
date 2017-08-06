import React, {
  Component,
  PropTypes
} from 'react';
import {
  findItemById
} from 'helpers/pureFunctions';
import {
  getDragSnappingTargets,
  getResizeSnappingTargets,
  getDragSnappingHelpersRect,
  getResizeSnappingHelpersPos,
  getActiveBoxIndex,
  isCurrentElementId,
  zoomValue,
  getChoiceLabelByIndex
} from 'helpers/formBuilderHelper';
// import ResizableAndMovablePlus from 'components/ResizableAndMovablePlus';
// import classNames from 'classnames';
import InteractWrapper from 'components/InteractWrapper';
import SimpleMappingToolbar from 'components/Toolbars/SimpleMappingToolbar';
import _ from 'lodash';
import interact from 'interact.js';
import styles from './DrawingBoard.scss';
import { formBuilderSelectMode } from 'constants/formBuilder';

class DrawingBoard extends Component {
  static propTypes = {
    /*
     * documents: Redux state to hold document image urls.
     */
    documents: PropTypes.array.isRequired,

    /*
     * questions: Redux state to store the array of questions.
     */
    questions: PropTypes.array.isRequired,

    /*
     * isModified: Redux state that indicates whether the form is modified since last save or load.
     */
    isModified: PropTypes.bool.isRequired,

    /*
     * saveElement: Redux action to save the current element being edited.
     */
    saveElement: PropTypes.func.isRequired,

    /*
     * documentMapping: Redux state to hold the bounding box of the question item in document
     */
    documentMapping: PropTypes.object.isRequired,

    /*
     * setMappingInfo: Action to update the document mapping info.
     */
    setMappingInfo: PropTypes.func.isRequired,

    /*
     * setMappingPositionInfo: Action to update the document mapping position info of active selection.
     */
    setMappingPositionInfo: PropTypes.func.isRequired,

    /*
     * setActiveBox: Redux action to set activeBox path.
     */
    setActiveBox: PropTypes.func.isRequired,

    /*
     * pageZoom: Redux state to keep the page zoom ratio.
     */
    pageZoom: PropTypes.number.isRequired,

    /*
     * pageNumber: Page number of the documents(image number).
     */
    pageNumber: PropTypes.number.isRequired,

    /*
     * containerId: Pages wrapper id, specified in data-id.
     */
    containerId: PropTypes.string.isRequired,

    /*
     * questionEditMode: Redux state to indicate question edit mode
     * One of formBuilderSelectMode
     */
    questionEditMode: PropTypes.number.isRequired,

    /*
     * setQuestionEditMode: Redux action to set question edit mode
     */
    setQuestionEditMode: PropTypes.func.isRequired,

    /*
     * getPageDOM: Get page dom element by page number.
     */
    getPageDOM: PropTypes.func.isRequired,

    /*
     * currentElement: Redux state to hold the element currently being edited.
     */
    currentElement: PropTypes.object,

    /*
     * setCurrentElement: Redux action to set/load currentElement
     */
    setCurrentElement: PropTypes.func.isRequired,

    /*
     * show: Redux modal show
     */
    show: PropTypes.func.isRequired,

    /*
     * viewportHeight: Page viewport height
     */
    viewportHeight: PropTypes.number.isRequired,

    /*
     * viewportWidth: Page viewport width
     */
    viewportWidth: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      toolbarPos: 'top',
      toolbarOffset: 0
    };
  };

  componentDidMount() {
    const element = this.refs.board;

    interact(element)
      .dropzone({
        accept: '.interactWrapper'
      })
      .on('drop', this.handleDrop);

    document.addEventListener('mousemove', this.handleBoardMouseMove);
    document.addEventListener('mouseup', this.handleBoardMouseUp);
  }

  handleDrop = (event) => {
    const { pageNumber, currentElement } = this.props;
    const { relatedTarget } = event;
    var metaData = JSON.parse(relatedTarget.dataset.meta);
    if (!currentElement) return;
    const { mappingInfo } = currentElement;
    if (mappingInfo.page_umber === pageNumber) return;
    metaData.destPageNumber = pageNumber;
    relatedTarget.dataset.meta = JSON.stringify(metaData);
  }

  getMousePos(event) {
    var e = event || window.event; // Moz || IE
    if (e.pageX || e.pageY) { // Moz
      return { x: e.pageX, y: e.pageY };
    } else if (e.clientX || e.clientY) { // IE
      return { x: e.clientX, y: e.clientY };
    } else {
      return { x: 0, y: 0 };
    }
  }

  getElementPos(el) {
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx, y: ly};
  }

  getScrollPos() {
    const { containerId } = this.props;
    var el = document.querySelector('[data-id=' + containerId+ ']');
    return {
      x: el.scrollLeft,
      y: el.scrollTop
    };
  }

  handleBoardMouseDown = (event) => {
    const activeBox = _.get(this.props, ['currentElement', 'activeBox']);
    if (!activeBox || event.button !== 0) return; // mouse left button
    const board = this.refs.board;
    const orgPos = this.getElementPos(board);
    const mousePos = this.getMousePos(event);
    const scrollPos = this.getScrollPos();
    const startX = mousePos.x - orgPos.x + scrollPos.x;
    const startY = mousePos.y - orgPos.y + scrollPos.y;
    this.setState({
      isDrawing: true,
      startX,
      startY,
      endX: startX,
      endY: startY
    });
  }

  handleBoardMouseMove = (event) => {
    if (event.buttons !== 1 || !this.state.isDrawing) return; // mouse left button
    const board = this.refs.board;
    const orgPos = this.getElementPos(board);
    const mousePos = this.getMousePos(event);
    const scrollPos = this.getScrollPos();
    this.setState({
      endX: mousePos.x - orgPos.x + scrollPos.x,
      endY: mousePos.y - orgPos.y + scrollPos.y
    });
  }

  handleBoardMouseUp = (event) => {
    if (event.button !== 0 || !this.state.isDrawing) return; // mouse left button
    const board = this.refs.board;
    const orgPos = this.getElementPos(board);
    const mousePos = this.getMousePos(event);
    const scrollPos = this.getScrollPos();
    const { startX, startY } = this.state;
    var endX = mousePos.x - orgPos.x + scrollPos.x;
    var endY = mousePos.y - orgPos.y + scrollPos.y;
    this.setState({
      isDrawing: false,
      endX,
      endY
    });
    const { setMappingPositionInfo, pageZoom, pageNumber } = this.props;

    if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) {
      return; // no need to add too small-sized box.
    }
    setMappingPositionInfo({
      'page': pageNumber,
      'box': {
        left: Math.min(startX, endX) / pageZoom,
        top: Math.min(startY, endY) / pageZoom,
        width: Math.abs(endX - startX) / pageZoom,
        height: Math.abs(endY - startY) / pageZoom
      }
    });
  }

  handleResizeStart = (metaData) => {
    this.setState({ isResizing: true });
  }

  handleResizeMove = (rect, metaData, isSnapping) => {
    const { documentMapping, pageZoom, currentElement } = this.props;

    if (isSnapping) {
      const helpersPos = getResizeSnappingHelpersPos(rect, currentElement, documentMapping, pageZoom);
      this.setResizeSnappingHelpers(helpersPos);
    } else {
      this.resetSnappingHelper();
    }
  }

  handleResizeEnd = (rect, metaData) => {
    const { setMappingPositionInfo, pageZoom } = this.props;
    this.setState({ isResizing: false });
    const newBoundingBox = {
      left: rect.left / pageZoom,
      top: rect.top / pageZoom,
      width: rect.width / pageZoom,
      height: rect.height / pageZoom
    };

    setMappingPositionInfo({
      'box': newBoundingBox
    });

    // Reset SnappingHelper
    this.resetSnappingHelper();
  }

  handleDragStart = (metaData) => {
    this.setState({ isDragging: true });
  }

  handleDragMove = (rect, metaData, isSnapping) => {
    const { documentMapping, pageZoom, currentElement } = this.props;

    if (isSnapping) {
      const helpersRect = getDragSnappingHelpersRect(rect, currentElement, documentMapping, pageZoom);
      this.setDragSnappingHelpers(helpersRect);
    } else {
      this.resetSnappingHelper();
    }
  }

  handleDragEnd = (rect, metaData) => {
    const { setMappingPositionInfo, pageZoom, pageNumber, getPageDOM } = this.props;
    this.setState({ isDragging: false });
    var newRect = rect;
    const { destPageNumber } = metaData;
    if (destPageNumber) {
      const destPage = getPageDOM(destPageNumber);
      const sourcePage = getPageDOM(pageNumber);
      newRect.top = rect.top > 0
        ? newRect.top - (destPage.offsetTop - sourcePage.offsetTop)
        : (sourcePage.offsetTop - destPage.offsetTop) + newRect.top;
    }
    const newBoundingBox = {
      left: newRect.left / pageZoom,
      top: newRect.top / pageZoom,
      width: newRect.width / pageZoom,
      height: newRect.height / pageZoom
    };

    setMappingPositionInfo({
      'page': destPageNumber && destPageNumber,
      'box': newBoundingBox
    });

    // Reset SnappingHelper
    this.resetSnappingHelper();
  }

  setDragSnappingHelpers(helpersRect) {
    const snappingHelper = this.refs.snappingHelper;
    var innerHTML = '';
    helpersRect.map(rect => {
      var style = `left: ${rect.left}px; top: ${rect.top}px;` +
        `width: ${rect.width}px; height: ${rect.height}px;`;
      innerHTML += `<div class="dragSnappingHelper" style="${style}"></div>`;
    });
    snappingHelper.innerHTML = innerHTML;
  }

  setResizeSnappingHelpers(helpersPos) {
    const snappingHelper = this.refs.snappingHelper;
    var innerHTML = '';
    helpersPos.map(pos => {
      var style = `left: ${pos.x}px; top: ${pos.y}px; ${pos.type}: ${pos.size}px;`;
      innerHTML += `<div class="${pos.type}SnappingHelper" style="${style}"></div>`;
    });
    snappingHelper.innerHTML = innerHTML;
  }

  resetSnappingHelper() {
    const snappingHelper = this.refs.snappingHelper;
    snappingHelper.innerHTML = '';
  }

  handleBoxClick = (metaData) => {
    const { setCurrentElement, setQuestionEditMode, setActiveBox,
      currentElement, isModified, show } = this.props;
    if (isCurrentElementId(metaData.id, currentElement)) {
      setActiveBox(metaData.activeBox);
    } else {
      if (isModified && currentElement) {
        show('cancelConfirmModal');
      } else {
        setQuestionEditMode(formBuilderSelectMode.QUESTION_DETAIL_VIEW);
        setCurrentElement({
          id: parseInt(metaData.id, 10),
          activeBox: metaData.path
        });
      }
    }
  };

  handleKeyDown = (event) => {
    const { currentElement, pageZoom, setMappingPositionInfo } = this.props;

    if (!currentElement) return;
    const activeBoxIndex = getActiveBoxIndex(currentElement);
    const boundingBox = _.get(currentElement, [
      'mappingInfo', 'positions', activeBoxIndex, 'box'
    ], false);
    if (!boundingBox) return;

    const newBoundingBox = _.assign({}, boundingBox);

    switch (event.keyCode) {
      case 37: // Left key
        newBoundingBox.left -= 1.0 / pageZoom;
        break;
      case 38: // Up key
        newBoundingBox.top -= 1.0 / pageZoom;
        break;
      case 39: // Right key
        newBoundingBox.left += 1.0 / pageZoom;
        break;
      case 40: // Down key
        newBoundingBox.top += 1.0 / pageZoom;
        break;
      case 46: // Delete key
        this.handleDeleteBox();
        return;
      default:
        return;
    }
    setMappingPositionInfo({
      'box': newBoundingBox
    });
    event.preventDefault();
  }

  handleDeleteBox = () => {
    const { setMappingInfo, currentElement } = this.props;
    const positions = _.get(currentElement, ['mappingInfo', 'positions'], []);
    const activeBoxIndex = getActiveBoxIndex(currentElement);
    positions[activeBoxIndex] = null;
    setMappingInfo({
      positions,
      activeIndex: activeBoxIndex
    });
  }

  handleToolbarValueChange = (values) => {
    const { setMappingPositionInfo } = this.props;
    setMappingPositionInfo({
      'box': values
    });
  }

  handleToolbarUpdate = (toolbarPos, toolbarOffset) => {
    this.setState({ toolbarPos, toolbarOffset });
  }

  getBoxLabel(elementId, boxIndex) {
    const { questions, currentElement } = this.props;
    const question = isCurrentElementId(elementId, currentElement)
      ? currentElement.question
      : findItemById(questions, elementId);
    const { type, choices } = question;
    return choices ? _.get(choices, [boxIndex, 'label'], getChoiceLabelByIndex(choices.length)) : type;
  }

  renderDocumentMappingComponents() {
    // todo: Fix this, disable this function temporary to get other parts working
    const { documentMapping, currentElement, pageZoom, pageNumber,
      viewportWidth, viewportHeight } = this.props;
    const activeBox = _.get(this.props, ['currentElement', 'activeBox']);
    var boardOptionals = {};
    if (activeBox) {
      boardOptionals['style'] = _.merge(boardOptionals['style'], {
        cursor: 'crosshair'
      });
    }

    const belongsToPage = (position) =>
      position && position.page === pageNumber;

    return Object.keys(documentMapping).map(id => {
      const mappingInfo = documentMapping[id];
      let finalMappingInfo = currentElement && id === currentElement.id
        ? currentElement.mappingInfo
        : mappingInfo;
      return Object.keys(finalMappingInfo).map((label) => {
        const positions = finalMappingInfo[label].positions;
        return Object.keys(positions).map((positionKey) => {
          const position = positions[positionKey];
          if (!belongsToPage(position)) return false;
          const isActive = false;
          const boundingBox = position.box;
          const zIndex = isActive ? 101 : 100;
          const path = _.join([label, 'positions', positionKey], '.');
          if (_.isEqual(path, activeBox)) return false; // skip & let draw active box in below function.
          return (
            <InteractWrapper
              x={zoomValue(boundingBox.left, pageZoom)}
              y={zoomValue(boundingBox.top, pageZoom)}
              zIndex={zIndex}
              active={isActive}
              className="interactWrapper"
              width={zoomValue(boundingBox.width, pageZoom)}
              height={zoomValue(boundingBox.height, pageZoom)}
              minWidth={10}
              minHeight={10}
              onClick={this.handleBoxClick}
              metaData={{ id, path }}
              viewportWidth={viewportWidth}
              viewportHeight={viewportHeight}
            >
              <div className={styles.boxLabel}>{'D'}</div>
            </InteractWrapper>
          );
        });
      });
    });
  }

  renderActiveBox() {
    const { documentMapping, pageNumber, pageZoom, currentElement,
      viewportWidth, viewportHeight } = this.props;
    const { isDragging, isResizing, toolbarOffset, toolbarPos } = this.state;
    if (!currentElement) return false;
    const activeBox = _.get(this.props, ['currentElement', 'activeBox']);

    const belongsToPage = (position) =>
      position && position.page === pageNumber;

    const position = _.get(currentElement.mappingInfo, activeBox);
    if (!belongsToPage(position)) return false;
    const isActive = true;
    const boundingBox = position.box;
    const zIndex = isActive ? 101 : 100;

    return (
      <InteractWrapper
        x={zoomValue(boundingBox.left, pageZoom)}
        y={zoomValue(boundingBox.top, pageZoom)}
        zIndex={zIndex}
        active={isActive}
        className="interactWrapper"
        width={zoomValue(boundingBox.width, pageZoom)}
        height={zoomValue(boundingBox.height, pageZoom)}
        minWidth={10}
        minHeight={10}
        onResizeStart={this.handleResizeStart}
        onResizeMove={this.handleResizeMove}
        onResizeEnd={this.handleResizeEnd}
        onDragStart={this.handleDragStart}
        onDragMove={this.handleDragMove}
        onDragEnd={this.handleDragEnd}
        viewportWidth={viewportWidth}
        viewportHeight={viewportHeight}
        dragSnapTargets={getDragSnappingTargets(documentMapping, currentElement, pageZoom)}
        resizeSnapTargets={getResizeSnappingTargets(documentMapping, currentElement, pageZoom)}
        metaData={{ id: currentElement.id, path: activeBox }}
        toolbar={!isDragging && !isResizing &&
          <SimpleMappingToolbar values={boundingBox} onChange={this.handleToolbarValueChange}
            placement={toolbarPos} offset={toolbarOffset} />
        }
        onToolbarUpdate={this.handleToolbarUpdate}
      >
        <div className={styles.boxLabel}>{'D'}</div>
      </InteractWrapper>
    );
  }

  render() {
    const activeBox = _.get(this.props, ['currentElement', 'activeBox']);
    const { isDrawing, startX, startY, endX, endY } = this.state;
    var boardOptionals = {};
    if (activeBox) {
      boardOptionals['style'] = _.merge(boardOptionals['style'], {
        cursor: 'crosshair'
      });
    }

    return (
      <div className={styles.board}
        onMouseDown={this.handleBoardMouseDown}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        ref="board"
        {...boardOptionals}>

        {this.renderDocumentMappingComponents()}
        {this.renderActiveBox()}
        {isDrawing &&
          <div className={styles.newBoxDraw}
            style={{
              left: Math.min(startX, endX),
              top: Math.min(startY, endY),
              width: Math.abs(endX - startX),
              height: Math.abs(endY - startY)
            }}>
          </div>
        }
        <div className={styles.snappingHelper} ref="snappingHelper"></div>
      </div>
    );
  }
}

export default DrawingBoard;
