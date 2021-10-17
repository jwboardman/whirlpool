import React from "react";
import styles from './Stock.module.css';

const Stock = props => {
  const { item } = props;
  const { key, data } = item;
  const { price } = data;
  return (
    <div className={styles.cardFrame} onClick={props.handleClick} data-key={key}>
      <div className={`${styles.row} ${styles.left} ${styles.cardHeader}`}>
        &nbsp;&nbsp;Price for {key}&nbsp;&nbsp;
      </div>
      <div className={`${styles.row} ${styles.left}`}>
        &nbsp;&nbsp;{price}
      </div>
    </div>
  );
};

export default Stock;