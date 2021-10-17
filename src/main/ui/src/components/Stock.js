import React, { useContext } from "react";
import AppContext from "../store/app-context";
import styles from './Stock.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Stock = props => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const { price } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <div className={`${styles.red} ${styles.right20}`} id="remove_stock" onClick={ctx.removeStockHandler} data-key={key}>
        <FontAwesomeIcon icon={faTrash} />
      </div>
      <div className={styles.flexColumn}>
        <div className={`${styles.row} ${styles.left} ${styles.cardHeader}`}>
          &nbsp;&nbsp;Price for {key}&nbsp;&nbsp;
        </div>
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;{price}
        </div>
      </div>
    </div>
  );
};

export default Stock;