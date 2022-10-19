/* eslint-disable default-param-last */
import { AnyAction } from 'redux';
import * as types from '../actions/types';
import initialState from '../../../reducers/initialState';
import StockInterface from '../../../types/StockInterface';

export default (
  state: StockInterface = initialState.stock,
  action: AnyAction
): StockInterface => {
  switch (action.type) {
    case types.SET_REMOVE_STOCK_HANDLER:
      return {
        ...state,
        removeStockHandler: action.removeStockHandler,
      };
    case types.SET_STOCK_LIST:
      return {
        ...state,
        stockList: action.stockList,
      };
    default:
      return state;
  }
};
