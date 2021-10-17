import React from 'react';
import styles from './WeatherLocation.module.css';

const WeatherLocation = props => {
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
    <div className={styles.cardFrame} onClick={props.handleClick} data-key={key}>
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
  );
};

export default WeatherLocation;