import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './UpDown.module.css';
import UpDownData from '../../types/UpDownData';
import InitialState from '../../types/InitialState';

interface UpDownProps {
  item: UpDownData;
}

const UpDown = (props: UpDownProps): JSX.Element => {
  const { item } = props;
  const { key, data } = item;
  const { status } = data;

  const removeUpDownHandler = useSelector(
    (state: InitialState) => state.upDown.removeUpDownHandler
  );

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        name="remove_updown"
        onClick={removeUpDownHandler}
        data-key={key}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
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

UpDown.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    data: PropTypes.shape({
      status: PropTypes.string,
    }),
  }).isRequired,
};

export default UpDown;
