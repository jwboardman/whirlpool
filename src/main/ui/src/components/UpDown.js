import React, { useContext } from "react";
import AppContext from "../store/app-context";
import styles from './UpDown.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const UpDown = props => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const { status } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <div className={`${styles.red} ${styles.right20}`} id="remove_updown" onClick={ctx.removeUpDownHandler} data-key={key}>
        <FontAwesomeIcon icon={faTrash} />
      </div>
      <div className={styles.flexColumn}>
        <div className={`${styles.row} ${styles.left} ${styles.cardHeader}`}>
          &nbsp;&nbsp;Status for {key}&nbsp;&nbsp;
        </div>
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;{status}
        </div>
      </div>
    </div>
  );
};

export default UpDown;