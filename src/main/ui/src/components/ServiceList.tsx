import { useContext } from 'react';
import PropTypes from 'prop-types';
import UpDownData from '../types/UpDownData';
import StockData from '../types/StockData';
import WeatherData from '../types/WeatherData';
import AppContext from '../store/app-context';
import WeatherLocation from './WeatherLocation';
import Stock from './Stock';
import UpDown from './UpDown';

import styles from './ServiceList.module.css';

interface ServiceListProps {
  serviceName: string;
}

const ServiceList = (props: ServiceListProps): JSX.Element => {
  const ctx = useContext(AppContext);
  const { serviceName } = props;

  let list;

  if (serviceName === 'weather') {
    list = ctx.weatherList;
  } else if (serviceName === 'stocks') {
    list = ctx.stockList;
  } else if (serviceName === 'updown') {
    list = ctx.upDownList;
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
