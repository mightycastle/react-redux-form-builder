import { bind } from 'redux-effects';
import { fetch } from 'redux-effects-fetch';
import { assignDefaults } from 'redux/utils/request';
import { createAction, handleActions } from 'redux-actions';
import { setUserProfile } from './auth';
import { startSubmit, stopSubmit } from 'redux-form';

// Fetch profile settings status
export const REQUEST_FETCH_PROFILE_SETTINGS = 'REQUEST_FETCH_PROFILE_SETTINGS';
export const RECEIVE_USER_PROFILE_SETTINGS = 'RECEIVE_USER_PROFILE_SETTINGS';
export const DONE_FETCHING_PROFILE_SETTINGS = 'DONE_FETCHING_PROFILE_SETTINGS';
export const REQUEST_SUBMIT_PROFILE_SETTINGS = 'REQUEST_SUBMIT_PROFILE_SETTINGS';

export const INIT_PROFILE_SETTINGS_STATE = {
  isPageBusy: false,
  data: {}
};

// ------------------------------------
// Actions with reducer
// ------------------------------------
export const requestSubmitProfileSettings = createAction(REQUEST_SUBMIT_PROFILE_SETTINGS);
export const requestFetchProfileSettings = createAction(REQUEST_FETCH_PROFILE_SETTINGS);
export const receiveServerUserProfileSettings = createAction(RECEIVE_USER_PROFILE_SETTINGS);
export const doneFetchingProfileSettings = createAction(DONE_FETCHING_PROFILE_SETTINGS);

// ------------------------------------
// Action: saveProfile
// ------------------------------------
export const processSubmitProfileSettings = (data) => {
  const apiURL = `${API_URL}/accounts/api/user/`;
  var formData = new FormData();
  formData.append('first_name', data.first_name);
  formData.append('last_name', data.last_name);
  formData.append('timezone', data.timezone);
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }
  if (data.avatar === '') {
    formData.append('avatar', '');
  }
  let fetchParams = assignDefaults({
    method: 'PUT',
    body: formData
  });

  // why?
  // The content type should be multipart/form-data
  // But it should not set here
  // Because it will not generate correct boundary
  // Removing Content-Type will force browser send
  // correct content-type
  delete fetchParams['headers']['Content-Type'];

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receiveServerUserProfileSettings(value));
      dispatch(setUserProfile(value));
      dispatch(doneFetchingProfileSettings());
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingProfileSettings());
    };
  };
  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};
// ------------------------------------
// Action: savePassword
// ------------------------------------
export const processSubmitPassword = (data) => {
  const apiURL = `${API_URL}/accounts/api/user/`;
  var formData = new FormData();
  formData.append('old_password', data.old_password);
  formData.append('new_password1', data.new_password1);
  formData.append('new_password2', data.new_password2);
  let fetchParams = assignDefaults({
    method: 'PUT',
    body: formData
  });
  delete fetchParams['headers']['Content-Type'];
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingProfileSettings());
    };
  };
  const fetchFail = ({value}) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingProfileSettings(value));
      dispatch(stopSubmit('passwordForm', value));
    };
  };
  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

export const fetchProfileSettings = () => {
  const fetchParams = assignDefaults({
    method: 'GET'
  });
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receiveServerUserProfileSettings(value));
      dispatch(doneFetchingProfileSettings());
    };
  };
  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingProfileSettings());
    };
  };

  return bind(fetch(`${API_URL}/accounts/api/user/`, fetchParams), fetchSuccess, fetchFail);
};

export const submitProfileSettings = () => {
  return (dispatch, getState) => {
    dispatch(requestSubmitProfileSettings());
    const formState = getState().form.profileSettingForm.values;
    dispatch(processSubmitProfileSettings(formState));
  };
};
export const submitPasswordSettings = () => {
  return (dispatch, getState) => {
    const formState = getState().form.passwordForm.values;
    dispatch(startSubmit('passwordForm'));
    dispatch(processSubmitPassword(formState));
  };
};

// ------------------------------------
// Reducer
// ------------------------------------
const profileReducer = handleActions({
  REQUEST_FETCH_PROFILE_SETTINGS: (state, action) =>
    Object.assign({}, state, {
      isPageBusy: true
    }),
  DONE_FETCHING_PROFILE_SETTINGS: (state, action) =>
    Object.assign({}, state, {
      isPageBusy: false
    }),
  RECEIVE_USER_PROFILE_SETTINGS: (state, action) =>
    Object.assign({}, state, {
      data: action.payload
    }),
  REQUEST_SUBMIT_PROFILE_SETTINGS: (state, action) => {
    return Object.assign({}, state, {
      isPageBusy: true
    });
  }
}, INIT_PROFILE_SETTINGS_STATE);

export default profileReducer;
