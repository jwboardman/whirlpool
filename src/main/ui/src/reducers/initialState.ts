import InitialState from '../types/InitialState';
import UpDownData from '../types/UpDownData';
import StockData from '../types/StockData';
import WeatherData from '../types/WeatherData';

const initialState: InitialState = {
  app: {
    isLoggedIn: false,
    websocket: null as any,
    clientName: '',
    loginHandler: undefined,
    logoutHandler: undefined,
  },
  stock: {
    removeStockHandler: undefined,
    stockList: [] as StockData[],
  },
  upDown: {
    removeUpDownHandler: undefined,
    upDownList: [] as UpDownData[],
  },
  weather: {
    removeWeatherHandler: undefined,
    weatherList: [] as WeatherData[],
  },
};

export default initialState;
