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
  const [ modalVisible, setModalVisible ] = useState(null);

  const doSend = useCallback(message => {
    if (ctx.websocket) {
      ctx.websocket.send(message);
      writeToScreen("SENT: " + message);
    } else {
      ctx.logoutHandler();
    }
  }, [ctx]);

  const sendStockAdd = useCallback((e, data) => {
    if (e) {
      e.preventDefault();
    }
    setModalVisible(null);
    if (data) {
      var message = '{"type":"TickerCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + data + '"}';
      doSend(message);
    }
  }, [doSend, ctx.clientName]);

  const sendUpDownAdd = useCallback((e, data) => {
    if (e) {
      e.preventDefault();
    }
    setModalVisible(null);
    if (data) {
      var message = '{"type":"UpDownCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + data + '"}';
      doSend(message);
    }
  }, [doSend, ctx.clientName]);

  const sendWeatherAdd = useCallback((e, data) => {
    if (e) {
      e.preventDefault();
    }
    setModalVisible(null);
    if (data) {
      var message = '{"type":"WeatherCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + data + '"}';
      doSend(message);
    }
  }, [doSend, ctx.clientName]);

  return (
    <>
      <Navigator />
      <p>&nbsp;</p>
      <div className={styles.flexCenter}>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`}>
              Stocks
              <div className={styles.leftRight5} id="add_stock" onClick={e => setModalVisible('stocks')}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="stocks" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`}>
              Up Down
              <div className={styles.leftRight5} id="add_updown" onClick={e => setModalVisible('updown')}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="updown" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <div className={`${styles.flexRow} ${styles.left15}`}>
              Weather
              <div className={styles.leftRight5} id="add_weather" onClick={e => setModalVisible('weather')}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
          </div>
          <ServiceList serviceName="weather" />
        </div>
      </div>
      {modalVisible && modalVisible === 'stocks' && (
        <Modal visible title='Enter the stock symbol' onClose={sendStockAdd} />
      )}
      {modalVisible && modalVisible === 'updown' && (
        <Modal visible title='Enter the URL' onClose={sendUpDownAdd} />
      )}
      {modalVisible && modalVisible === 'weather' && (
        <Modal visible title='Enter the zip code' onClose={sendWeatherAdd} />
      )}
    </>
  );
};

export default Main;
