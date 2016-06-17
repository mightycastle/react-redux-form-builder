import { mergeItemIntoArray } from 'helpers/pureFunctions';

export const RECEIVE_FORM = 'RECEIVE_FORM';
export const REQUEST_FORM = 'REQUEST_FORM';
export const DONE_FETCHING_FORM = 'DONE_FETCHING_FORM';
export const REQUEST_SUBMIT = 'REQUEST_SUBMIT';
export const DONE_SUBMIT = 'DONE_SUBMIT';
export const SET_ACTIVE_INPUT_NAME = 'SET_ACTIVE_INPUT_NAME';
export const ADD_ELEMENT = 'ADD_ELEMENT';

export const INIT_BUILDER_STATE = {
  id: 0,
  isFetching: false, // indicates the form is being loaded.
  isSubmitting: false, // indicates the form submission is being processed.
  questions: [],
  logics: [],
  documents: [
    'http://localhost:3000/doc_example.jpg', // for temp purpose, should fetch from backend.
    'http://localhost:3000/doc_example.jpg' // for temp purpose, should fetch from backend.
  ],
  formConfig: {},
  documentMapping: [],
  activeInputName: '',
  currentQuestion: {},
  lastQuestionId: 0
};

// ------------------------------------
// Action: setActiveInputName
// ------------------------------------
export const setActiveInputName = (inputName) => {
  return {
    type: SET_ACTIVE_INPUT_NAME,
    inputName
  };
}

// ------------------------------------
// Action: addElement
// ------------------------------------
export const addElement = (element) => {
  return {
    type: ADD_ELEMENT,
    element
  };
}

const _addElement = (state, action) => {
  var { question, mappingInfo } = action.element;
  const newQuestionId = state.lastQuestionId + 1;
  question.id = newQuestionId;
  mappingInfo.id = newQuestionId;
  return {
    questions: mergeItemIntoArray(state.questions, question),
    documentMapping: mergeItemIntoArray(state.documentMapping, mappingInfo),
    lastQuestionId: newQuestionId
  };
}
// ------------------------------------
// Reducer
// ------------------------------------
const formBuilderReducer = (state = INIT_BUILDER_STATE, action) => {
  switch (action.type) {
    case RECEIVE_FORM:
      return Object.assign({}, state, {
        id: action.id
      });
    case REQUEST_FORM:
      return Object.assign({}, state, {
        isFetching: true
      });
    case DONE_FETCHING_FORM:
      return Object.assign({}, state, {
        isFetching: false
      });
    case REQUEST_SUBMIT:
      return Object.assign({}, state, {
        isSubmitting: true
      });
    case DONE_SUBMIT:
      return Object.assign({}, state, {
        isSubmitting: false
      });
    case SET_ACTIVE_INPUT_NAME:
      return Object.assign({}, state, {
        activeInputName: action.inputName
      });
    case ADD_ELEMENT:
      return Object.assign({}, state, _addElement(state, action));
    default:
      return state;
  };
}

export default formBuilderReducer;