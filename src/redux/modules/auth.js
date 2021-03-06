import { bind } from 'redux-effects';
import { fetch } from 'redux-effects-fetch';
import { assignDefaults } from 'redux/utils/request';
import { createAction, handleActions } from 'redux-actions';
import { replace } from './router';
import { loginUrl } from 'helpers/urlHelper';
import { reset } from 'redux-form';

export const REQUEST_AUTH = 'REQUEST_AUTH';
export const RECEIVE_AUTH_STATUS = 'RECEIVE_AUTH_STATUS';

export const NOT_LOGGED_IN = 'NOT_LOGGED_IN';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGGING_IN = 'LOGGING_IN';
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';

export const SET_USER_PROFILE = 'SET_USER_PROFILE';
export const SET_IS_FETCHING_USER = 'SET_IS_FETCHING_USER';

export const LOGOUT = 'LOGOUT';

export const REQUEST_SIGNUP = 'REQUEST_SIGNUP';
export const RECEIVE_SIGNUP_STATUS = 'RECEIVE_SIGNUP_STATUS';
export const SET_SERVER_RESPONSE = 'SET_SERVER_RESPONSE';

export const SIGNING_UP = 'SIGNING_UP';
export const SIGNED_UP = 'SIGNED_UP';
export const NOT_SIGNED_UP = 'NOT_SIGNED_UP';

export const INIT_AUTH_STATE = {
  authStatus: NOT_LOGGED_IN,    // !IMPORTANT: required for login failed measurement.
  user: {
    first_name: '',
    last_name: ''
  },
  isAuthenticating: false,
  isUpdating: false,
  serverResponse: {}
};

// ------------------------------------
// Action: submitLoginForm
// ------------------------------------
export const submitLoginForm = (email, password) => {
  return (dispatch, getState) => {
    dispatch(requestAuth());
    dispatch(processAuth(email, password));
  };
};

// ------------------------------------
// Action: submitSignupForm
// ------------------------------------
export const submitSignupForm = (email, password) => {
  return (dispatch, getState) => {
    dispatch(requestSignup());
    dispatch(processSignup(email, password));
  };
};

// ------------------------------------
// Action: updateUserProfile
// ------------------------------------
export const updateUserProfile = (user) => {
  const body = {
    first_name: user.first_name,
    last_name: user.last_name
  };
  const fetchParams = assignDefaults({
    method: 'PUT',
    body
  });
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(setUserProfile(value));
      dispatch(setIsFetchingUserInfo(false));
    };
  };
  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(setIsFetchingUserInfo(false));
    };
  };
  return [
    setIsFetchingUserInfo(true),
    bind(fetch(`${API_URL}/accounts/api/user/`, fetchParams), fetchSuccess, fetchFail)
  ];
};

// ------------------------------------
// Action: requestAuth
// ------------------------------------
export const requestAuth = createAction(REQUEST_AUTH);

// ------------------------------------
// Action: requestSignup
// ------------------------------------
export const requestSignup = createAction(REQUEST_SIGNUP);

// ------------------------------------
// Action: processAuth
// ------------------------------------
export const processAuth = (email, password) => {
  const apiURL = `${API_URL}/accounts/api/auth/login/`;
  const body = { email, password };
  const fetchParams = assignDefaults({
    method: 'POST',
    body
  });

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receiveAuthStatus(value.authenticated));
      if (value.authenticated) {
        dispatch(reset('loginForm'));
        dispatch(setIsFetchingUserInfo(true));
        dispatch(fetchUserInfo());
        dispatch(setIsFetchingUserInfo(false));
      }
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(receiveAuthStatus(false)); // Hide loading spinner
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Action: processSignup
// ------------------------------------
export const processSignup = (email, password, type='onboarding-free-plan') => {
  const apiURL = `${API_URL}/accounts/api/` + type + '/';
  const body = { email, password };
  const fetchParams = assignDefaults({
    method: 'POST',
    body
  });

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(receiveSignUpStatus(true));
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(setServerResponse(data.value));
      dispatch(receiveSignUpStatus(false));
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Action: sign up submitted
// ------------------------------------
export const receiveSignUpStatus = createAction(RECEIVE_SIGNUP_STATUS);

// ------------------------------------
// Action: server response
// ------------------------------------
export const setServerResponse = createAction(SET_SERVER_RESPONSE);

// ------------------------------------
// Action: setIsFetchingUserInfo
// ------------------------------------
export const setIsFetchingUserInfo = createAction(SET_IS_FETCHING_USER);

// ------------------------------------
// Action: fetchUserInfo
// ------------------------------------
export const fetchUserInfo = () => {
  const fetchParams = assignDefaults({
    method: 'GET'
  });
  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(setUserProfile(value));
      dispatch(receiveAuthStatus(true)); // Set user auth status to LOGGED_IN
      dispatch(setIsFetchingUserInfo(false));
    };
  };
  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(setIsFetchingUserInfo(false));
    };
  };
  return [
    setIsFetchingUserInfo(true),
    bind(fetch(`${API_URL}/accounts/api/user/`, fetchParams), fetchSuccess, fetchFail)
  ];
};

// ------------------------------------
// Action: doneAuth
// ------------------------------------
export const receiveAuthStatus = createAction(RECEIVE_AUTH_STATUS);

// ------------------------------------
// Action: setUserProfile
// ------------------------------------
export const setUserProfile = createAction(SET_USER_PROFILE);

// ------------------------------------
// Action: handleLogout
// ------------------------------------
export const processLogout = () => {
  const apiURL = `${API_URL}/accounts/api/auth/logout/`;
  const fetchParams = assignDefaults({
    method: 'POST'
  });

  const fetchSuccess = () => {
    return (dispatch, getState) => {
      dispatch(logout());
      dispatch(replace(loginUrl()));
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      console.log('Logout failed');
      // TODO: what should happen if this fails for some reason?
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Action: logout
// ------------------------------------
export const logout = createAction(LOGOUT);

// ------------------------------------
// Reducer
// ------------------------------------
const authReducer = handleActions({
  REQUEST_AUTH: (state, action) =>
    Object.assign({}, state, {
      authStatus: LOGGING_IN
    }),
  REQUEST_SIGNUP: (state, action) =>
    Object.assign({}, state, {
      authStatus: SIGNING_UP
    }),
  RECEIVE_AUTH_STATUS: (state, action) =>
    Object.assign({}, state, {
      authStatus: action.payload ? LOGGED_IN : LOGIN_FAILED
    }),
  RECEIVE_SIGNUP_STATUS: (state, action) =>
    Object.assign({}, state, {
      authStatus: action.payload ? LOGGED_IN : NOT_SIGNED_UP
    }),
  SET_SERVER_RESPONSE: (state, action) =>
    Object.assign({}, state, {
      serverResponse: {...action.payload}
    }),
  SET_USER_PROFILE: (state, action) =>
    Object.assign({}, state, {
      user: {...action.payload}
    }),
  SET_IS_FETCHING_USER: (state, action) =>
    Object.assign({}, state, {
      isAuthenticating: action.payload
    }),
  LOGOUT: (state, action) =>
    Object.assign({}, state, {
      authStatus: LOGGED_OUT,
      user: INIT_AUTH_STATE.user // Clear user info after logout
    })
}, INIT_AUTH_STATE);

export default authReducer;
