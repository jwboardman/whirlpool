import { useContext } from 'react';
import PropTypes from 'prop-types';
import AppContext from '../store/app-context';
import WeatherLocation from './WeatherLocation';
import Stock from './Stock';
import UpDown from './UpDown';

import styles from './ServiceList.module.css';

const ServiceList = props => {
  const ctx = useContext(AppContext);
  const { serviceName } = props;

  const handleClick = e => {
    e.preventDefault();
    const key = e.currentTarget.getAttribute('data-key');
    document.getElementById('data').value = key;
  };

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
      {
        list.map(item => {
          if (serviceName === 'weather') {
            return (<WeatherLocation key={item.key} item={item} handleClick={handleClick} />)
          } else if (serviceName === 'stocks') {
            return (<Stock key={item.key} item={item} handleClick={handleClick} />)
          } else if (serviceName === 'updown') {
            return (<UpDown key={item.key} item={item} handleClick={handleClick} />)
          }

          return (<></>)
        })
      }
    </div>
  );
};

ServiceList.propTypes = {
  serviceName: PropTypes.string.isRequired
};

export default ServiceList;