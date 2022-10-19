/* eslint-disable default-param-last */
import { AnyAction } from 'redux';
import * as types from '../actions/types';
import initialState from '../../../reducers/initialState';
import UpDownInterface from '../../../types/UpDownInterface';

export default (
  state: UpDownInterface = initialState.upDown,
  action: AnyAction
): UpDownInterface => {
  switch (action.type) {
    case types.SET_REMOVE_UP_DOWN_HANDLER:
      return {
        ...state,
        removeUpDownHandler: action.removeUpDownHandler,
      };
    case types.SET_UP_DOWN_LIST:
      return {
        ...state,
        upDownList: action.upDownList,
      };
    default:
      return state;
  }
};
