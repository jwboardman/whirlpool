/* eslint-disable default-param-last */
import { AnyAction } from 'redux';
import * as types from '../actions/types';
import initialState from '../../../reducers/initialState';
import AppInterface from '../../../types/AppInterface';

export default (
  state: AppInterface = initialState.app,
  action: AnyAction
): AppInterface => {
  switch (action.type) {
    case types.SET_IS_LOGGED_IN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };
    case types.SET_WEBSOCKET:
      return {
        ...state,
        websocket: action.websocket,
      };
    case types.SET_CLIENT_NAME:
      return {
        ...state,
        clientName: action.clientName,
      };
    case types.SET_LOGIN_HANDLER:
      return {
        ...state,
        loginHandler: action.loginHandler,
      };
    case types.SET_LOGOUT_HANDLER:
      return {
        ...state,
        logoutHandler: action.logoutHandler,
      };
    default:
      return state;
  }
};
