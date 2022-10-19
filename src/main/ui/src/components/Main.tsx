/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AppContext from '../store/app-context';
import Navigator from './Navigator';
import ServiceList from './ServiceList';
import Modal from './Modal';

import { writeToScreen } from '../common/common';

import styles from './Main.module.css';
import { WhirlpoolContext } from '../types/WhirlpoolContext';

const Main = (): JSX.Element => {
  const ctx = useContext<WhirlpoolContext>(AppContext);
  const { websocket, clientName } = ctx;
  const [modalVisible, setModalVisible] = useState<string | null>(null);

  const doSend = useCallback(
    (e: any, messageType: string, data: string) => {
      if (e) {
        e.preventDefault();
      }

      setModalVisible(null);

      if (websocket && data) {
        const message = `{"type":"${messageType}", "id":"${clientName}", "command":"add", "subscription":"${data}"}`;
        websocket.send(message);
        writeToScreen(`SENT: ${message}`);
      }
    },
    [clientName, websocket]
  );

  // this is called from the Modal component after the user enters the symbol
  const sendStockAdd = useCallback(
    (e: any, data: string) => {
      doSend(e, 'TickerCommand', data);
    },
    [doSend]
  );

  // this is called from the Modal component after the user enters the URL
  const sendUpDownAdd = useCallback(
    (e: any, data: string) => {
      doSend(e, 'UpDownCommand', data);
    },
    [doSend]
  );

  // this is called from the Modal component after the user enters the zip code
  const sendWeatherAdd = useCallback(
    (e: any, data: string) => {
      doSend(e, 'WeatherCommand', data);
    },
    [doSend]
  );

  return (
    <>
      <Navigator />
      <p>&nbsp;</p>
      <div className={styles.flexCenter}>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <button
              type="button"
              className={`${styles.flexRow} ${styles.left15}`}
              onClick={() => setModalVisible('stocks')}
            >
              Stocks
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </button>
          </div>
          <ServiceList serviceName="stocks" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <button
              type="button"
              className={`${styles.flexRow} ${styles.left15}`}
              onClick={() => setModalVisible('updown')}
            >
              Up Down
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </button>
          </div>
          <ServiceList serviceName="updown" />
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.box}>
            <button
              type="button"
              className={`${styles.flexRow} ${styles.left15}`}
              onClick={() => setModalVisible('weather')}
            >
              Weather
              <div className={styles.leftRight5}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </button>
          </div>
          <ServiceList serviceName="weather" />
        </div>
      </div>
      {modalVisible === 'stocks' && (
        <Modal visible title="Enter the stock symbol" onClose={sendStockAdd} />
      )}
      {modalVisible === 'updown' && (
        <Modal visible title="Enter the URL" onClose={sendUpDownAdd} />
      )}
      {modalVisible === 'weather' && (
        <Modal visible title="Enter the zip code" onClose={sendWeatherAdd} />
      )}
    </>
  );
};

export default Main;
