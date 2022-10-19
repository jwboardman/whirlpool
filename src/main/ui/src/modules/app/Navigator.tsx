import { useSelector } from 'react-redux';
import styles from './Navigator.module.css';
import InitialState from '../../types/InitialState';

const Navigator = (): JSX.Element => {
  const clientName = useSelector((state: InitialState) => state.app.clientName);
  const logoutHandler = useSelector(
    (state: InitialState) => state.app.logoutHandler
  );

  return (
    <div className={styles.navbar}>
      <div className={styles.navItem}>User: {clientName}</div>
      <input
        type="button"
        className={styles.buttonNavItem}
        value="Logout"
        onClick={logoutHandler}
      />
    </div>
  );
};

export default Navigator;
