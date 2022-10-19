import React from 'react';
import StockData from '../types/StockData';
import UpDownData from '../types/UpDownData';
import WeatherData from '../types/WeatherData';
import { WhirlpoolContext } from '../types/WhirlpoolContext';

const AppContext = React.createContext<WhirlpoolContext>({
  isLoggedIn: false,
  websocket: null as any,
  clientName: '',
  loginHandler: undefined,
  logoutHandler: undefined,
  removeStockHandler: undefined,
  removeUpDownHandler: undefined,
  removeWeatherHandler: undefined,
  stockList: [] as StockData[],
  upDownList: [] as UpDownData[],
  weatherList: [] as WeatherData[],
});

export default AppContext;
