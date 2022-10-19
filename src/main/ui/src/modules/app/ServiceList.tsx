import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import UpDownData from '../../types/UpDownData';
import StockData from '../../types/StockData';
import WeatherData from '../../types/WeatherData';
import WeatherLocation from '../weather/WeatherLocation';
import Stock from '../stock/Stock';
import UpDown from '../upDown/UpDown';
import InitialState from '../../types/InitialState';

import styles from './ServiceList.module.css';

interface ServiceListProps {
  serviceName: string;
}

const ServiceList = (props: ServiceListProps): JSX.Element => {
  const { serviceName } = props;
  const stockList = useSelector((state: InitialState) => state.stock.stockList);
  const upDownList = useSelector(
    (state: InitialState) => state.upDown.upDownList
  );
  const weatherList = useSelector(
    (state: InitialState) => state.weather.weatherList
  );

  let list;

  if (serviceName === 'weather') {
    list = weatherList;
  } else if (serviceName === 'stocks') {
    list = stockList;
  } else if (serviceName === 'updown') {
    list = upDownList;
  }

  return (
    <div className={styles.top}>
      {list?.map((item) => {
        if (serviceName === 'weather') {
          return <WeatherLocation key={item.key} item={item as WeatherData} />;
        }

        if (serviceName === 'stocks') {
          return <Stock key={item.key} item={item as StockData} />;
        }

        if (serviceName === 'updown') {
          return <UpDown key={item.key} item={item as UpDownData} />;
        }

        return null;
      })}
    </div>
  );
};

ServiceList.propTypes = {
  serviceName: PropTypes.string.isRequired,
};

export default ServiceList;
