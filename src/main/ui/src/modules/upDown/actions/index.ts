import { AnyAction } from 'redux';
import UpDownData from '../../../types/UpDownData';
import * as types from './types';

export const setRemoveUpDownHandler = (removeUpDownHandler: any): AnyAction => {
  return {
    type: types.SET_REMOVE_UP_DOWN_HANDLER,
    removeUpDownHandler,
  };
};

export const setUpDownList = (upDownList: UpDownData[]): AnyAction => {
  return {
    type: types.SET_UP_DOWN_LIST,
    upDownList,
  };
};
