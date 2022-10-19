import StockData from './StockData';
import UpDownData from './UpDownData';
import WeatherData from './WeatherData';

export interface WhirlpoolContext {
  isLoggedIn: boolean;
  websocket: any;
  clientName: string;
  loginHandler: any;
  logoutHandler: any;
  removeStockHandler: any;
  removeUpDownHandler: any;
  removeWeatherHandler: any;
  stockList: StockData[];
  upDownList: UpDownData[];
  weatherList: WeatherData[];
}
