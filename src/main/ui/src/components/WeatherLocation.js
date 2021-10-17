import React, { useContext } from "react";
import AppContext from "../store/app-context";
import styles from './WeatherLocation.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const WeatherLocation = props => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const {
    temperature,
    feelsLikeTemperature,
    conditions,
    city,
    stateOrCountry
  } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <div className={`${styles.red} ${styles.right20}`} id="remove_weather" onClick={ctx.removeWeatherHandler} data-key={key}>
        <FontAwesomeIcon icon={faTrash} />
      </div>
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

export default WeatherLocation;