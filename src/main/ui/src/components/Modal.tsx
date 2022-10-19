import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

interface ModalProps {
  onClose: any;
  title: string;
  visible: boolean;
}

const Modal = (props: ModalProps): JSX.Element | null => {
  const { onClose, title, visible } = props;
  const [error, setError] = useState<string | null>(null);

  const doClose = useCallback(
    (e: any) => {
      const data = document?.getElementById('data')?.value;
      if (!data) {
        setError('Field is required');
      } else {
        setError(null);
        onClose(e, data);
      }
    },
    [onClose, setError]
  );

  const doCancel = useCallback(
    (e: any) => {
      setError(null);
      onClose(e, null);
    },
    [onClose, setError]
  );

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modal}>
        <h2 className={styles.h2}>{title}</h2>
        <div className={styles.content}>
          <input id="data" type="text" size={40} />
        </div>
        <div className={styles.error}>{error}</div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={(e) => doClose(e)}
          >
            Add
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={(e) => doCancel(e)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default Modal;
