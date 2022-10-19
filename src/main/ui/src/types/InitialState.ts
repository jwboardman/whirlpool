import AppInterface from './AppInterface';
import StockInterface from './StockInterface';
import UpDownInterface from './UpDownInterface';
import WeatherInterface from './WeatherInterface';

declare interface InitialState {
  app: AppInterface;
  stock: StockInterface;
  upDown: UpDownInterface;
  weather: WeatherInterface;
}

export default InitialState;
