import { useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../store/app-context';
import styles from './WeatherLocation.module.css';
import WeatherData from '../types/WeatherData';

interface WeatherProps {
  item: WeatherData;
}

const WeatherLocation = (props: WeatherProps): JSX.Element => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const {
    temperature,
    feelsLikeTemperature,
    conditions,
    city,
    stateOrCountry,
  } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        id="remove_weather"
        onClick={ctx.removeWeatherHandler as any}
        data-key={key}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <div className={styles.flexColumn}>
        <div className={`${styles.row} ${styles.left} ${styles.cardHeader}`}>
          &nbsp;&nbsp;Weather for {key} ({city}, {stateOrCountry})&nbsp;&nbsp;
        </div>
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;Air Temp {temperature} degrees
        </div>
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;Feels Like {feelsLikeTemperature} degrees
        </div>
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;Condition {conditions}
        </div>
      </div>
    </div>
  );
};

WeatherLocation.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    data: PropTypes.shape({
      temperature: PropTypes.string,
      feelsLikeTemperature: PropTypes.string,
      conditions: PropTypes.string,
      city: PropTypes.string,
      stateOrCountry: PropTypes.string,
    }),
  }).isRequired,
};

export default WeatherLocation;
