import React, { Component, PropTypes } from 'react';
import BuilderHeader from 'components/Headers/BuilderHeader';
import ElementsListView from '../ElementsListView/ElementsListView';
import PageView from '../PageView/PageView';
import QuestionEditView from '../QuestionEditView/QuestionEditView';
import styles from './FormBuilder.scss'

class FormBuilder extends Component {

  static propTypes = {
    /*
     * Form ID
     */
    id: PropTypes.number.isRequired,

    /*
     * questions: Redux state to store the array of questions.
     */
    questions: PropTypes.array.isRequired,

    /*
     * logics: Redux state to store the array of logics.
     */
    logics: PropTypes.array.isRequired,
    
    /*
     * documentMapping: Redux state to hold the bounding box of the question item in document
     */
    documentMapping: PropTypes.array.isRequired,

    /*
     * isFetching: Redux state that indicates whether the requested form is being fetched from backend
     */
    isFetching: PropTypes.bool.isRequired,

    /*
     * isVerifying: Redux state that indicates the status whether the form is being submitted
     */
    isSubmitting: PropTypes.bool.isRequired,

    /*
     * activeInputName: Redux state to indicate the active input element name.
     */
    activeInputName: PropTypes.string.isRequired,
    
    /*
     * setActiveInputName: used to set active input element selected, and enables to draw on the right
     */
    setActiveInputName: PropTypes.func.isRequired,

    /*
     * addElement: used to set active input element selected, and enables to draw on the right
     */
    addElement: PropTypes.func.isRequired
  };

  componentWillMount() {

  }

  componentWillReceiveProps(props) {

  }

  componentDidMount() {

  }
  
  resetActiveInputName = () => {
    const { setActiveInputName } = this.props;
    setActiveInputName('');
  }

  render() {
    const { params } = this.props;
    return (
      <div className={styles.formBuilderContainer}>
        <BuilderHeader />
        <div className={styles.formBuilderContent}>
          <div className={styles.leftPanel} onClick={this.resetActiveInputName}>
            {params.id
              ? <QuestionEditView />
              : <ElementsListView {...this.props} />
            }
          </div>
          <div className={styles.rightPanel}>
            <PageView {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

export default FormBuilder;
