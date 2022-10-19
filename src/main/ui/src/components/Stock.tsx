import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../store/app-context';
import styles from './Stock.module.css';
import StockData from '../types/StockData';

interface StockProps {
  item: StockData;
}

const Stock = (props: StockProps): JSX.Element => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const { price } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        id="remove_stock"
        onClick={ctx.removeStockHandler as any}
        data-key={key}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
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

Stock.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    data: PropTypes.shape({
      price: PropTypes.string,
    }),
  }).isRequired,
};

export default Stock;
