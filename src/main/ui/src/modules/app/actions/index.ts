import { AnyAction } from 'redux';
import * as types from './types';

export const setIsLoggedIn = (isLoggedIn: boolean): AnyAction => {
  return {
    type: types.SET_IS_LOGGED_IN,
    isLoggedIn,
  };
};

export const setWebSocket = (websocket: WebSocket): AnyAction => {
  return {
    type: types.SET_WEBSOCKET,
    websocket,
  };
};

export const setClientName = (clientName: string): AnyAction => {
  return {
    type: types.SET_CLIENT_NAME,
    clientName,
  };
};

export const setLoginHandler = (loginHandler: any): AnyAction => {
  return {
    type: types.SET_LOGIN_HANDLER,
    loginHandler,
  };
};

export const setLogoutHandler = (logoutHandler: any): AnyAction => {
  return {
    type: types.SET_LOGOUT_HANDLER,
    logoutHandler,
  };
};

export function userLoggedOut(): AnyAction {
  return {
    type: types.USER_LOGGED_OUT,
  };
}
