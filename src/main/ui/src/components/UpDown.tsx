import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../store/app-context';
import styles from './UpDown.module.css';
import UpDownData from '../types/UpDownData';

interface UpDownProps {
  item: UpDownData;
}

const UpDown = (props: UpDownProps): JSX.Element => {
  const ctx = useContext(AppContext);
  const { item } = props;
  const { key, data } = item;
  const { status } = data;

  return (
    <div className={`${styles.cardFrame} ${styles.flexRow}`}>
      <button
        type="button"
        className={`${styles.red} ${styles.right20}`}
        id="remove_updown"
        onClick={ctx.removeUpDownHandler as any}
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
