import { combineReducers } from 'redux';
import InitialState from '../types/InitialState';
import * as appTypes from '../modules/app/actions/types';
import app from '../modules/app/reducers';
import stock from '../modules/stock/reducers';
import upDown from '../modules/upDown/reducers';
import weather from '../modules/weather/reducers';

const appReducer = combineReducers({
  app,
  stock,
  upDown,
  weather,
});

const rootReducer = (
  state: InitialState | undefined,
  action: any
): InitialState => {
  if (action.type === appTypes.USER_LOGGED_OUT) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
