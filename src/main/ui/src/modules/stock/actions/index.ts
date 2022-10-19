import { AnyAction } from 'redux';
import StockData from '../../../types/StockData';
import * as types from './types';

export const setRemoveStockHandler = (removeStockHandler: any): AnyAction => {
  return {
    type: types.SET_REMOVE_STOCK_HANDLER,
    removeStockHandler,
  };
};

export const setStockList = (stockList: StockData[]): AnyAction => {
  return {
    type: types.SET_STOCK_LIST,
    stockList,
  };
};
