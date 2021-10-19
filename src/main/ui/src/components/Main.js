import React, { useCallback, useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../store/app-context';
import Navigator from './Navigator';
import ServiceList from './ServiceList';
import Modal from './Modal';

import { writeToScreen } from '../common/common';

import styles from './Main.module.css';

const Main = () => {
  const ctx = useContext(AppContext);
  const { websocket, clientName } = ctx;
  const [ modalVisible, setModalVisible ] = useState(null);

  const doSend = useCallback((e, messageType, data) => {
    if (e) {
      e.preventDefault();
    }

    setModalVisible(null);

    if (websocket && data) {
      const message = `{"type":"${messageType}", "id":"${clientName}", "command":"add", "subscription":"${data}"}`;
      websocket.send(message);
      writeToScreen("SENT: " + message);
    }
  }, [clientName, websocket]);

  // this is called from the Modal component after the user enters the symbol
  const sendStockAdd = useCallback((e, data) => {
    doSend(e, 'TickerCommand', data);
  }, [doSend]);

  // this is called from the Modal component after the user enters the URL
  const sendUpDownAdd = useCallback((e, data) => {
    doSend(e, 'UpDownCommand', data);
  }, [doSend]);

  // this is called from the Modal component after the user enters the zip code
  const sendWeatherAdd = useCallback((e, data) => {
    doSend(e, 'WeatherCommand', data);
  }, [doSend]);

  return (
    <>
      <Navigator />
      <p>&nbsp;</p>
      <div className={styles.flexCenter}>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`} onClick={e => setModalVisible('stocks')}>
              Stocks
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="stocks" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`} onClick={e => setModalVisible('updown')}>
              Up Down
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="updown" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`} onClick={e => setModalVisible('weather')}>
              Weather
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="weather" />
        </div>
      </div>
      {modalVisible === 'stocks' && (
        <Modal visible title='Enter the stock symbol' onClose={sendStockAdd} />
      )}
      {modalVisible === 'updown' && (
        <Modal visible title='Enter the URL' onClose={sendUpDownAdd} />
      )}
      {modalVisible === 'weather' && (
        <Modal visible title='Enter the zip code' onClose={sendWeatherAdd} />
      )}
    </>
  );
};

export default Main;
