import { AnyAction } from 'redux';
import WeatherData from '../../../types/WeatherData';
import * as types from './types';

export const setRemoveWeatherHandler = (
  removeWeatherHandler: any
): AnyAction => {
  return {
    type: types.SET_REMOVE_WEATHER_HANDLER,
    removeWeatherHandler,
  };
};

export const setWeatherList = (weatherList: WeatherData[]): AnyAction => {
  return {
    type: types.SET_WEATHER_LIST,
    weatherList,
  };
};
