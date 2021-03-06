import { bind } from 'redux-effects';
import { fetch } from 'redux-effects-fetch';
import { assignDefaults } from 'redux/utils/request';
import { buildQueryString } from 'helpers/pureFunctions';
import { getPageQueryParamsObject } from 'helpers/pageListingHelpers';
import { createAction, handleActions } from 'redux-actions';
import _ from 'lodash';

export const RECEIVE_SUBMISSIONS = 'RECEIVE_SUBMISSIONS';
export const REQUEST_SUBMISSIONS = 'REQUEST_SUBMISSIONS';
export const DONE_FETCHING_SUBMISSIONS = 'DONE_FETCHING_SUBMISSIONS';
export const SELECT_SUBMISSION_ITEMS = 'SELECT_SUBMISSION_ITEMS';

export const SELECT_ANALYTICS_PERIOD = 'SELECT_ANALYTICS_PERIOD';

const SET_STATUS_FILTER_OPTIONS = 'SET_STATUS_FILTER_OPTIONS';
export const SET_SUBMISSIONS_PAGE_SIZE = 'SET_SUBMISSIONS_PAGE_SIZE';
const NEXT_SUBMISSIONS_PAGE = 'NEXT_SUBMISSIONS_PAGE';
const PREVIOUS_SUBMISSIONS_PAGE = 'PREVIOUS_SUBMISSIONS_PAGE';

const SET_COMPANY_USERS = 'SET_COMPANY_USERS';

export const INIT_SUBMISSIONS_STATE = {
  id: 0,
  isFetching: false, // indicates the Submissions is being loaded.
  submissions: [], // holds the submission data.
  page: 1, // indicates the current page number submission table page.
  pageSize: 5, // indicates number of items per page.
  totalCount: 0, // indicates total number of submission items available on server.
  sortColumn: 'response_id', // indicates the column name to sort by
  sortAscending: false, // indicates the sort direction (true: ascending | false: descending)
  selectedStatusFilterOptions: '1,2,3,4,5,6,7',
  selectedItems: [], // holds the selected items id.
  companyUsers: [],
  analyticsPeriod: 'today', // indicates the selected period of analytics
  analytics: {
    today: {
      view: 1235,
      rate: 0.12
    },
    week: {
      view: 13433,
      rate: 0.65
    },
    month: {
      view: 923430,
      rate: 0.78349
    }
  },
  activities: [
    {
      name: 'Jordan McCown',
      action: 'completed',
      form: 'SMSF Non Corporate CFD',
      time: '2m ago'
    }, {
      name: 'Lihan Li',
      action: 'viewed',
      form: 'Personal Form',
      time: '5m ago'
    }, {
      name: 'Shaun Harvey',
      action: 'viewed',
      form: 'Personal Form',
      time: '1h ago'
    }, {
      name: 'Andrew Olsen',
      action: 'completed',
      form: 'Tonik Employment Form',
      time: '2h ago'
    }, {
      name: 'Someone Else',
      action: 'deleted',
      form: 'Something Important Form',
      time: '5h ago'
    }
  ],
  environmentalSavings: {
    trees: 12,
    water: 3850,
    co2: 120
  }
};

// ------------------------------------
// Action: requestSubmissions
// ------------------------------------
export const requestSubmissions = createAction(REQUEST_SUBMISSIONS);

// ------------------------------------
// Action: requestSubmissions
// ------------------------------------
export const receiveSubmissions = createAction(RECEIVE_SUBMISSIONS);

// ------------------------------------
// Action: doneFetchingSubmissions
// ------------------------------------
export const doneFetchingSubmissions = createAction(DONE_FETCHING_SUBMISSIONS);

// ------------------------------------
// Action: selectItems
// ------------------------------------
export const selectItems = createAction(SELECT_SUBMISSION_ITEMS);

export const selectAnalyticsPeriod = createAction(SELECT_ANALYTICS_PERIOD);

const nextSubmissionsPage = createAction(NEXT_SUBMISSIONS_PAGE);
const previousSubmissionsPage = createAction(PREVIOUS_SUBMISSIONS_PAGE);
export const goToNextPage = () => {
  return (dispatch, getState) => {
    dispatch(nextSubmissionsPage());
    dispatch(fetchSubmissions({
      page: getState().submissionsList.page
    }));
  };
};
export const goToPreviousPage = () => {
  return (dispatch, getState) => {
    dispatch(previousSubmissionsPage());
    dispatch(fetchSubmissions({
      page: getState().submissionsList.page
    }));
  };
};

const setStatusFilterOptions = createAction(SET_STATUS_FILTER_OPTIONS);
export const filterSubmissionsByStatus = (newStatus) => {
  return (dispatch, getState) => {
    dispatch(setStatusFilterOptions(newStatus));
    dispatch(fetchSubmissions({
      status: newStatus
    }));
  };
};

// ------------------------------------
// Action: fetchSubmissions
// ------------------------------------
export const fetchSubmissions = (options) => {
  return (dispatch, getState) => {
    const submissionsList = getState().submissionsList;
    options = Object.assign(_.pick(submissionsList, [
      'page', // current page number, can be overwritten by options.
      'pageSize', // current page size, can be overwritten by options.
      'sortColumn', // current sort column, can be overwritten by options.
      'sortAscending', // current sort direction, can be overwritten by options.
      'status'
    ]), options);
    dispatch(requestSubmissions());
    dispatch(processFetchSubmissions(options));
  };
};

// ------------------------------------
// Action: selectAllItems
// ------------------------------------
export const selectAllItems = (selected) => {
  return (dispatch, getState) => {
    var selectedItems = [];
    if (selected) {
      const submissionsList = getState().submissionsList;
      const submissions = submissionsList.submissions;
      selectedItems = _.map(submissions, 'response_id');
    }
    dispatch(selectItems(selectedItems));
  };
};

// ------------------------------------
// Action: toggleSelectItem
// ------------------------------------
export const toggleSelectItem = (id) => {
  return (dispatch, getState) => {
    const submissionsList = getState().submissionsList;
    const selectedItems = submissionsList.selectedItems;
    const newSelectedItems = _.xor(selectedItems, [id]);
    dispatch(selectItems(newSelectedItems));
  };
};

// ------------------------------------
// Action: selectItem()
// ------------------------------------
export const selectItem = ({id, selected}) => {
  return (dispatch, getState) => {
    const submissionsList = getState().submissionsList;
    var selectedItems = submissionsList.selectedItems;
    if (selected) {
      selectedItems = _.union(selectedItems, [id]);
    } else {
      selectedItems = _.difference(selectedItems, [id]);
    }
    dispatch(selectItems(selectedItems));
  };
};

export const setPageSize = createAction(SET_SUBMISSIONS_PAGE_SIZE);

// ------------------------------------
// Helper Action: processFetchSubmissions
// Params
//   options: object with fields - page, pageSize, sortAscending, sortColumn
// ------------------------------------
const processFetchSubmissions = (options) => {
  var apiURL = `${API_URL}/form_document/api/form_response/`;

  const query = getPageQueryParamsObject(options);
  const queryString = buildQueryString(query);
  queryString && (apiURL += `?${queryString}`);

  const fetchParams = assignDefaults();

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(processReceiveSubmissions(value, options));
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      dispatch(doneFetchingSubmissions()); // Hide loading spinner
    };
  };

  return bind(fetch(apiURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Helper Action: processReceiveSubmissions
// ------------------------------------
const processReceiveSubmissions = (res, options) => {
  const totalCount = res.count;
  const { next, previous } = res;
  const data = res.data;
  return (dispatch, getState) => {
    dispatch(receiveSubmissions({
      page: options.page || 1,
      pageSize: options.pageSize,
      sortColumn: options.sortColumn,
      sortAscending: options.sortAscending,
      submissions: data,
      totalCount,
      next,
      previous,
      selectedItems: []
    }));
    dispatch(doneFetchingSubmissions()); // Hide loading spinner
  };
};

// ------------------------------------
// Action: fetchCompanyUsers
// ------------------------------------
export const fetchCompanyUsers = () => {
  var requestUrl = `${API_URL}/accounts/api/company_users/`;
  var method = 'GET';
  const fetchParams = assignDefaults({method});

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(setCompanyUsers(value));
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      console.error('Failed to fetch users');
    };
  };

  return bind(fetch(requestUrl, fetchParams), fetchSuccess, fetchFail);
};
const setCompanyUsers = createAction(SET_COMPANY_USERS);

// ------------------------------------
// Action: setAssignee
// ------------------------------------
export const setAssignee = (submissionIdList, userId) => {
  return (dispatch, getState) => {
    submissionIdList.map((id) => {
      dispatch(processSetAssignee(id, userId));
    });
  };
};
export const processSetAssignee = (id, userId) => {
  var body = {user_id: userId};
  var method = 'POST';
  var requestURL = `${API_URL}/form_document/api/form_response/${id}/assign/`;
  const fetchParams = assignDefaults({
    method,
    body
  });

  const fetchSuccess = ({value}) => {
    return (dispatch, getState) => {
      dispatch(fetchSubmissions());
    };
  };

  const fetchFail = (data) => {
    return (dispatch, getState) => {
      console.error('Failed to assign form response');
    };
  };

  return bind(fetch(requestURL, fetchParams), fetchSuccess, fetchFail);
};

// ------------------------------------
// Reducer
// ------------------------------------
const submissionsReducer = handleActions({
  RECEIVE_SUBMISSIONS: (state, action) =>
    Object.assign({}, state, action.payload),

  REQUEST_SUBMISSIONS: (state, action) =>
    Object.assign({}, state, {
      isFetching: true
    }),

  DONE_FETCHING_SUBMISSIONS: (state, action) =>
    Object.assign({}, state, {
      isFetching: false
    }),

  SELECT_SUBMISSION_ITEMS: (state, action) =>
    Object.assign({}, state, {
      selectedItems: action.payload
    }),

  SELECT_ANALYTICS_PERIOD: (state, action) =>
    Object.assign({}, state, {
      analyticsPeriod: action.payload
    }),

  SET_SUBMISSIONS_PAGE_SIZE: (state, action) =>
    Object.assign({}, state, {
      pageSize: parseInt(action.payload),
      page: 1
    }),
  SET_STATUS_FILTER_OPTIONS: (state, action) =>
    Object.assign({}, state, {
      selectedStatusFilterOptions: action.payload,
      page: 1
    }),
  NEXT_SUBMISSIONS_PAGE: (state, action) =>
    Object.assign({}, state, {
      page: state.page + 1
    }),
  PREVIOUS_SUBMISSIONS_PAGE: (state, action) =>
    Object.assign({}, state, {
      page: state.page - 1
    }),
  SET_COMPANY_USERS: (state, action) =>
    Object.assign({}, state, {
      companyUsers: action.payload
    })
}, INIT_SUBMISSIONS_STATE);

export default submissionsReducer;
