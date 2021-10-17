import React, { useContext } from 'react';
import AppContext from '../store/app-context';
import styles from './Navigator.module.css';

const Navigator = props => {
  const ctx = useContext(AppContext);

  return (
    <div className={styles.navbar}>
      <div className={styles.navItem}>
        User: {ctx.clientName}
      </div>
      <input type="button" className={styles.buttonNavItem} value="Logout" onClick={ctx.logoutHandler} />
    </div>
  );
};

export default Navigator;