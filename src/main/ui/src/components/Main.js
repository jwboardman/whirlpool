import React, { useContext } from 'react';
import AppContext from '../store/app-context';
import ServiceList from './ServiceList';

import { writeToScreen } from '../common/common';

import styles from './Main.module.css';

const Main = () => {
  const ctx = useContext(AppContext);

  function doSend(message) {
    if (ctx.websocket) {
      ctx.websocket.send(message);
      writeToScreen("SENT: " + message);
    } else {
      ctx.logoutHandler();
    }
  }

  function sendStockAdd(e) {
    e.preventDefault();
    const symbol = document.getElementById('data').value;
    var message = '{"type":"TickerCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + symbol + '"}';
    doSend(message);
  }

  function sendStockRemove(e) {
    e.preventDefault();
    const symbol = document.getElementById('data').value;
    var message = '{"type":"TickerCommand", "id":"' + ctx.clientName + '", "command":"remove", "subscription":"' + symbol + '"}';
    doSend(message);
  }

  function sendUpDownAdd(e) {
    e.preventDefault();
    const url = document.getElementById('data').value;
    var message = '{"type":"UpDownCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + url + '"}';
    doSend(message);
  }

  function sendUpDownRemove(e) {
    e.preventDefault();
    const url = document.getElementById('data').value;
    var message = '{"type":"UpDownCommand", "id":"' + ctx.clientName + '", "command":"remove", "subscription":"' + url + '"}';
    doSend(message);
  }

  function sendWeatherAdd(e) {
    e.preventDefault();
    const cityState = document.getElementById('data').value;
    var message = '{"type":"WeatherCommand", "id":"' + ctx.clientName + '", "command":"add", "subscription":"' + cityState + '"}';
    doSend(message);
  }

  function sendWeatherRemove(e) {
    e.preventDefault();
    const cityState = document.getElementById('data').value;
    var message = '{"type":"WeatherCommand", "id":"' + ctx.clientName + '", "command":"remove", "subscription":"' + cityState + '"}';
    doSend(message);
  }

  return (
    <>
      <p id="current_user">Logged in User: {ctx.clientName}</p>

      <div style={{display: "flex", justifyContent: "center"}}>
        <div style={{display: "flex", flexDirection: "column"}}>
          Data
          <input style={{marginRight: 25}} id="data" type="text" size="40" />
        </div>
        <div style={{display: "flex", flexDirection: "column"}}>
          Stock
          <div style={{display: "flex", flexDirection: "row"}}>
            <input style={{marginRight: 5}} id="add_stock" className={styles.plain} type="button" value="A" onClick={sendStockAdd} />
            <input style={{marginRight: 20}} id="remove_stock" className={styles.red} type="button" value="X" onClick={sendStockRemove} />
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column"}}>
          <div style={{marginRight: 15}}>UpDown</div>
          <div style={{display: "flex", flexDirection: "row"}}>
            <input style={{marginRight: 5}} id="add_updown" type="button" className={styles.plain} value="A" onClick={sendUpDownAdd} />
            <input style={{marginRight: 20}} id="remove_updown" className={styles.red} type="button" value="X" onClick={sendUpDownRemove} />
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column"}}>
          Zip Code
          <div style={{display: "flex", flexDirection: "row"}}>
            <input id="add_weather" className={styles.plain} type="button" value="A" onClick={sendWeatherAdd} />
            <input id="remove_weather" className={styles.red} type="button" value="X" onClick={sendWeatherRemove} />
          </div>
        </div>
      </div>

      <p>&nbsp;</p>

      <div style={{display: "flex", justifyContent: "center"}}>
        <div style={{display: "flex", flexDirection: "column"}}>
          Stocks
          <ServiceList serviceName="stocks" />
        </div>
        <div style={{display: "flex", flexDirection: "column"}}>
          Up Down
          <ServiceList serviceName="updown" />
        </div>
        <div style={{display: "flex", flexDirection: "column"}}>
          Weather
          <ServiceList serviceName="weather" />
        </div>
      </div>

      <p>&nbsp;</p>

      {/* <select id="output" size="15" style={{"width": "100%"}}></select> */}
    </>
  );
};

export default Main;
