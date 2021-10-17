import React from "react";
import styles from './UpDown.module.css';

const UpDown = props => {
  const { item } = props;
  const { key, data } = item;
  const { status } = data;

  return (
    <div className={styles.cardFrame} onClick={props.handleClick} data-key={key}>
      <div className={`${styles.row} ${styles.left} ${styles.cardHeader}`}>
        &nbsp;&nbsp;Status for {key}&nbsp;&nbsp;
      </div>
      <div className={`${styles.row} ${styles.left}`}>
        &nbsp;&nbsp;{status}
      </div>
    </div>
  );
};

export default UpDown;