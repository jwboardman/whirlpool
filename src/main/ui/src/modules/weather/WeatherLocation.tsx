import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './WeatherLocation.module.css';
import WeatherData from '../../types/WeatherData';
import InitialState from '../../types/InitialState';

interface WeatherProps {
  item: WeatherData;
}

const WeatherLocation = (props: WeatherProps): JSX.Element => {
  const { item } = props;
  const { key, data, timestamp } = item;
  const {
    temperature,
    feelsLikeTemperature,
    conditions,
    city,
    stateOrCountry,
  } = data;

  const removeWeatherHandler = useSelector(
    (state: InitialState) => state.weather.removeWeatherHandler
  );

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        name="remove_weather"
        onClick={removeWeatherHandler}
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
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;{timestamp}&nbsp;&nbsp;
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
    timestamp: PropTypes.string,
  }).isRequired,
};

export default WeatherLocation;
