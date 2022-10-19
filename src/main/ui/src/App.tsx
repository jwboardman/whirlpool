/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Login from './modules/app/Login';
import Main from './modules/app/Main';
import { checkCookie, deleteCookie, writeToScreen } from './common/common';

import './App.css';
import StockData from './types/StockData';
import UpDownData from './types/UpDownData';
import WeatherData from './types/WeatherData';
import InitialState from './types/InitialState';

import * as appActions from './modules/app/actions';
import * as stockActions from './modules/stock/actions';
import * as upDownActions from './modules/upDown/actions';
import * as weatherActions from './modules/weather/actions';

import store from './store';

const App = (): JSX.Element => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const [serverDown, setServerDown] = useState(false);
  const isLoggedIn = useSelector((state: InitialState) => state.app.isLoggedIn);
  const websocket = useSelector((state: InitialState) => state.app.websocket);
  const clientName = useSelector((state: InitialState) => state.app.clientName);
  const stockList = useSelector((state: InitialState) => state.stock.stockList);
  const upDownList = useSelector(
    (state: InitialState) => state.upDown.upDownList
  );
  const weatherList = useSelector(
    (state: InitialState) => state.weather.weatherList
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onMessage = useCallback(
    (evt: any) => {
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

        dispatch(stockActions.setStockList(stockData));
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

        dispatch(upDownActions.setUpDownList(upDownData));
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

        dispatch(weatherActions.setWeatherList(weatherData));
      } else if (
        dataResponse.command === 'remove' &&
        (dataResponse.type === 'TickerCommand' ||
          dataResponse.type === 'UpDownCommand' ||
          dataResponse.type === 'WeatherCommand')
      ) {
        if (dataResponse.type === 'TickerCommand') {
          const newStockList = stockList.filter(
            (item) => item.key !== dataResponse.subscription
          );
          dispatch(stockActions.setStockList(newStockList));
        } else if (dataResponse.type === 'UpDownCommand') {
          const newUpDownList = upDownList.filter(
            (item) => item.key !== dataResponse.subscription
          );
          dispatch(upDownActions.setUpDownList(newUpDownList));
        } else if (dataResponse.type === 'WeatherCommand') {
          const newWeatherList = weatherList.filter(
            (item) => item.key !== dataResponse.subscription
          );
          dispatch(weatherActions.setWeatherList(newWeatherList));
        }
      }
    },
    [weatherList, stockList, upDownList]
  );

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
        dispatch(appActions.setIsLoggedIn(false));
        setIsLoggingOut(false);
      };

      // Every time the server sends us something over the websocket, this function will be called.
      ws.onmessage = onMessage;
      ws.onerror = (evt) => {
        setServerDown(true);
        ws = null as any;
        dispatch(appActions.setWebSocket(ws));
        writeToScreen(`ERROR: ${JSON.stringify(evt)}`);
      };

      dispatch(appActions.setWebSocket(ws));
    },
    [websocket, setServerDown]
  );

  const authenticated = useCallback(
    (username: string) => {
      dispatch(appActions.setClientName(username));
      dispatch(appActions.setIsLoggedIn(true));
      startWebSocket(username);
    },
    [startWebSocket, clientName, isLoggedIn]
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

      stockList.forEach((item) =>
        removeSubscription(item.key, 'TickerCommand')
      );

      dispatch(stockActions.setStockList([] as StockData[]));

      upDownList.forEach((item) =>
        removeSubscription(item.key, 'UpDownCommand')
      );

      dispatch(upDownActions.setUpDownList([] as UpDownData[]));

      weatherList.forEach((item) =>
        removeSubscription(item.key, 'WeatherCommand')
      );

      dispatch(weatherActions.setWeatherList([] as WeatherData[]));

      setIsLoggingOut(true);
    },
    [removeSubscription]
  );

  // This effect checks to see if we have a cookie set so we can automatically login
  useEffect(() => {
    dispatch(appActions.setLoginHandler(loginHandler));
    dispatch(appActions.setLogoutHandler(logoutHandler));
    dispatch(stockActions.setRemoveStockHandler(removeStockHandler));
    dispatch(upDownActions.setRemoveUpDownHandler(removeUpDownHandler));
    dispatch(weatherActions.setRemoveWeatherHandler(removeWeatherHandler));
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
            dispatch(appActions.setWebSocket(null as any));
          }
          deleteCookie();
          dispatch(appActions.setClientName(''));
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
      {!isLoggedIn ? (
        <div id="logindiv">
          <Login />
        </div>
      ) : (
        <div id="maindiv">
          <Main />
        </div>
      )}
    </div>
  );
};

export default App;
