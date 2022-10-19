/* eslint-disable no-restricted-syntax */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Login from './components/Login';
import Main from './components/Main';
import AppContext from './store/app-context';
import { checkCookie, deleteCookie, writeToScreen } from './common/common';

import './App.css';
import StockData from './types/StockData';
import UpDownData from './types/UpDownData';
import WeatherData from './types/WeatherData';

const App = (): JSX.Element => {
  const [serverDown, setServerDown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [websocket, setWebsocket] = useState<any>(null);
  const [clientName, setClientName] = useState<string>('');
  const [stockList, setStockList] = useState([] as StockData[]);
  const [upDownList, setUpDownList] = useState([] as UpDownData[]);
  const [weatherList, setWeatherList] = useState([] as WeatherData[]);

  // Connect the websocket to the server and set up listeners to handle incoming changes
  const startWebSocket = useCallback(
    (username: string) => {
      const wsProt = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
      let ws = new WebSocket(
        `${wsProt}//${window.location.hostname}:8080/wswhirlpool`
      );
      ws.onopen = () => {
        writeToScreen('CONNECTED');
        const message = `{"type":"ALL", "id":"${username}", "command":"refresh", "subscription":"ALL"}`;
        ws.send(message);
        writeToScreen(`SENT: ${message}`);
      };

      ws.onclose = () => {
        // once the websocket is finished closing, we've completed the logout process
        writeToScreen('DISCONNECTED');
        setIsLoggedIn(false);
        setIsLoggingOut(false);
      };

      // Every time the server sends us something over the websocket, this function will be called.
      ws.onmessage = (evt) => {
        const data = evt.data as string;
        const dataResponse = JSON.parse(data);
        let subData;
        let propertyName;

        writeToScreen(`RESPONSE: ${data}`);

        if (dataResponse.type === 'TickerResponse') {
          const stockData: StockData[] = [];

          for (propertyName in dataResponse.subscriptionData) {
            if (
              Object.prototype.hasOwnProperty.call(
                dataResponse.subscriptionData,
                propertyName
              )
            ) {
              subData = dataResponse.subscriptionData[propertyName]
                .split('\\"')
                .join('"');
              stockData.push({
                key: propertyName,
                data: { price: `$${subData}` },
              });
            }
          }

          setStockList(stockData);
        } else if (dataResponse.type === 'UpDownResponse') {
          const upDownData: UpDownData[] = [];

          for (propertyName in dataResponse.subscriptionData) {
            if (
              Object.prototype.hasOwnProperty.call(
                dataResponse.subscriptionData,
                propertyName
              )
            ) {
              subData = dataResponse.subscriptionData[propertyName]
                .split('\\"')
                .join('"');
              upDownData.push({ key: propertyName, data: { status: subData } });
            }
          }

          setUpDownList(upDownData);
        } else if (dataResponse.type === 'WeatherResponse') {
          const weatherData: WeatherData[] = [];

          for (propertyName in dataResponse.subscriptionData) {
            if (
              Object.prototype.hasOwnProperty.call(
                dataResponse.subscriptionData,
                propertyName
              )
            ) {
              subData = dataResponse.subscriptionData[propertyName]
                .split('\\"')
                .join('"');
              const weatherSubscriptionData = JSON.parse(subData);
              weatherData.push({
                key: propertyName,
                data: weatherSubscriptionData,
              });
            }
          }

          setWeatherList(weatherData);
        } else if (
          dataResponse.command === 'remove' &&
          (dataResponse.type === 'TickerCommand' ||
            dataResponse.type === 'UpDownCommand' ||
            dataResponse.type === 'WeatherCommand')
        ) {
          if (dataResponse.type === 'TickerCommand') {
            setStockList((prevState) => {
              return prevState.filter(
                (item) => item.key !== dataResponse.subscription
              );
            });
          } else if (dataResponse.type === 'UpDownCommand') {
            setUpDownList((prevState) => {
              return prevState.filter(
                (item) => item.key !== dataResponse.subscription
              );
            });
          } else if (dataResponse.type === 'WeatherCommand') {
            setWeatherList((prevState) => {
              return prevState.filter(
                (item) => item.key !== dataResponse.subscription
              );
            });
          }
        }
      };

      ws.onerror = (evt) => {
        setServerDown(true);
        ws = null as any;
        setWebsocket(ws);
        writeToScreen(`ERROR: ${JSON.stringify(evt)}`);
      };

      setWebsocket(ws);
    },
    [setWebsocket, setWeatherList, setStockList, setUpDownList, setServerDown]
  );

  const authenticated = useCallback(
    (username: string) => {
      setClientName(username);
      setIsLoggedIn(true);
      startWebSocket(username);
    },
    [startWebSocket, setClientName, setIsLoggedIn]
  );

  const loginHandler = useCallback(
    async (e: Event, username: string, password: string) => {
      e.preventDefault();

      // This is now called when the user logs in
      const jsonBody = JSON.stringify({ user: username, password });
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=utf-8',
          'Content-Length': jsonBody.length,
        } as unknown as Headers,
        body: jsonBody,
      });

      if (response.status === 200) {
        const json = await response.json();
        if (json?.response === 'fail') {
          // eslint-disable-next-line no-alert
          alert(`Error: login failed`);
        } else {
          setServerDown(false);
          authenticated(username);
        }
      } else {
        // eslint-disable-next-line no-alert
        alert(`Error: ${response.status}`);
      }
    },
    [authenticated, setServerDown]
  );

  const removeSubscription = useCallback(
    (data: string, subscriptionType: string) => {
      const message = `{"type":"${subscriptionType}", "id":"${clientName}", "command":"remove", "subscription":"${data}"}`;
      if (websocket) {
        websocket.send(message);
        writeToScreen(`SENT: ${message}`);
      }
    },
    [clientName, websocket]
  );

  const removeSubscriptionHandler = useCallback(
    (e: Event, subscriptionType: string) => {
      if (e) {
        e.preventDefault();
      }
      const data = e?.currentTarget?.getAttribute('data-key');
      removeSubscription(data, subscriptionType);
    },
    [removeSubscription]
  );

  const removeStockHandler = useCallback(
    (e: Event) => {
      if (e) {
        e.preventDefault();
      }
      removeSubscriptionHandler(e, 'TickerCommand');
    },
    [removeSubscriptionHandler]
  );

  const removeUpDownHandler = useCallback(
    (e: Event) => {
      if (e) {
        e.preventDefault();
      }
      removeSubscriptionHandler(e, 'UpDownCommand');
    },
    [removeSubscriptionHandler]
  );

  const removeWeatherHandler = useCallback(
    (e: Event) => {
      if (e) {
        e.preventDefault();
      }
      removeSubscriptionHandler(e, 'WeatherCommand');
    },
    [removeSubscriptionHandler]
  );

  const logoutHandler = useCallback(
    async (e: Event) => {
      if (e) {
        e.preventDefault();
      }

      setStockList((prevState) => {
        prevState.forEach((item) =>
          removeSubscription(item.key, 'TickerCommand')
        );
        return prevState;
      });

      setUpDownList((prevState) => {
        prevState.forEach((item) =>
          removeSubscription(item.key, 'UpDownCommand')
        );
        return prevState;
      });

      setWeatherList((prevState) => {
        prevState.forEach((item) =>
          removeSubscription(item.key, 'WeatherCommand')
        );
        return prevState;
      });

      setIsLoggingOut(true);
    },
    [removeSubscription]
  );

  // This effect checks to see if we have a cookie set so we can automatically login
  useEffect(() => {
    const username = checkCookie();
    if (username && !isLoggedIn && !serverDown) {
      authenticated(username);
    }
  }, [isLoggedIn, authenticated, serverDown]);

  // This effect looks to see if all subscriptions have been removed while logging out.
  // When that happens, then we can finish up and close everything cleanly.
  useEffect(() => {
    const checkFinishedLogout = async () => {
      // if we are logging out, check to see if all of the subscriptions have been updated
      // from the result of the websocket remove subscription calls. if everything is done,
      // finish the logout
      if (
        isLoggingOut &&
        !stockList.length &&
        !upDownList.length &&
        !weatherList.length
      ) {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
            'Content-Length': 2,
          } as unknown as Headers,
          body: {} as BodyInit,
        });

        if (response.status === 200) {
          await response.json();
          if (websocket) {
            websocket.close();
            setWebsocket(null as any);
          }
          deleteCookie();
          setClientName('');
        } else {
          // eslint-disable-next-line no-alert
          alert(`Error: ${response.status}`);
        }
      }
    };

    checkFinishedLogout();
  }, [clientName, isLoggingOut, stockList, upDownList, weatherList, websocket]);

  return (
    <div className="app">
      <AppContext.Provider
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          isLoggedIn,
          websocket,
          clientName,
          loginHandler,
          logoutHandler,
          removeStockHandler,
          removeUpDownHandler,
          removeWeatherHandler,
          stockList,
          upDownList,
          weatherList,
        }}
      >
        {!isLoggedIn ? (
          <div id="logindiv">
            <Login />
          </div>
        ) : (
          <div id="maindiv">
            <Main />
          </div>
        )}
      </AppContext.Provider>
    </div>
  );
};

export default App;
