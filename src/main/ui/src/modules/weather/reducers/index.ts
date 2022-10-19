/* eslint-disable default-param-last */
import { AnyAction } from 'redux';
import * as types from '../actions/types';
import initialState from '../../../reducers/initialState';
import WeatherInterface from '../../../types/WeatherInterface';

export default (
  state: WeatherInterface = initialState.weather,
  action: AnyAction
): WeatherInterface => {
  switch (action.type) {
    case types.SET_REMOVE_WEATHER_HANDLER:
      return {
        ...state,
        removeWeatherHandler: action.removeWeatherHandler,
      };
    case types.SET_WEATHER_LIST:
      return {
        ...state,
        weatherList: action.weatherList,
      };
    default:
      return state;
  }
};
