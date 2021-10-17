import React, { useCallback, useState } from "react";
import styles from './Modal.module.css';

const Modal = props => {
  const { onClose, title, visible } = props;
  const [ error, setError ] = useState(null);

  const doClose = useCallback(e => {
    const data = document.getElementById('data').value;
    if (!data) {
      setError('Field is required');
    } else {
      setError(null);
      onClose(e, data);
    }
  }, [onClose, setError]);

  const doCancel = useCallback(e => {
    setError(null);
    onClose(e, null);
  }, [onClose, setError]);

  if (!visible) {
    return <></>;
  }

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modal}>
        <h2 className={styles.h2}>{title}</h2>
        <div className={styles.content}>
          <input id="data" type="text" size="40" />
        </div>
        <div className={styles.error}>
          {error}
        </div>
        <div className={styles.actions}>
          <button className={styles.button} onClick={e => doClose(e)}>
              Add
          </button>
          <button className={styles.button} onClick={e => doCancel(e)}>
              Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
