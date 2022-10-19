import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './Stock.module.css';
import StockData from '../../types/StockData';
import InitialState from '../../types/InitialState';

interface StockProps {
  item: StockData;
}

const Stock = (props: StockProps): JSX.Element => {
  const { item } = props;
  const { key, data, timestamp } = item;
  const { price } = data;

  const removeStockHandler = useSelector(
    (state: InitialState) => state.stock.removeStockHandler
  );

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        name="remove_stock"
        onClick={removeStockHandler}
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
        <div className={`${styles.row} ${styles.left}`}>
          &nbsp;&nbsp;{timestamp}&nbsp;&nbsp;
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
    timestamp: PropTypes.string,
  }).isRequired,
};

export default Stock;
