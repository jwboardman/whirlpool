import React, { useCallback, useState } from 'react';
import Login from './components/Login';
import Main from './components/Main';
import AppContext from './store/app-context';
import { checkCookie, writeToScreen } from './common/common';

import './App.css';

const App = () => {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const [ isLoggingOut, setIsLoggingOut ] = useState(false);
  const [ websocket, setWebsocket ] = useState(null);
  const [ clientName, setClientName ] = useState(null);
  const [ stockList, setStockList ] = useState([]);
  const [ upDownList, setUpDownList ] = useState([]);
  const [ weatherList, setWeatherList ] = useState([]);

  const startWebSocket = useCallback(wsUrl => {
    const wsProt = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
    const ws = new WebSocket(wsProt + "//" + window.location.hostname + ":8080/wsticker");
    ws.onopen = evt => {
      writeToScreen("CONNECTED");
    };

    ws.onclose = evt => {
      writeToScreen("DISCONNECTED");
      setIsLoggedIn(false);
      setIsLoggingOut(false);
    };

    ws.onmessage = evt => {
      var data = evt.data;
      var dataResponse = JSON.parse(data),
          subData,
          propertyName;

      writeToScreen('RESPONSE: ' + data);

      if (dataResponse.type === 'TickerResponse') {
        const stockData = [];

        for (propertyName in dataResponse['subscriptionData']) {
          if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
            subData = dataResponse['subscriptionData'][propertyName].split('\\"').join('"');
            stockData.push({key: propertyName, data: {price: '$' + subData}});
          }
        }

        setStockList(stockData);
      } else if (dataResponse.type === 'UpDownResponse') {
        const upDownData = [];

        for (propertyName in dataResponse['subscriptionData']) {
          if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
            subData = dataResponse['subscriptionData'][propertyName].split('\\"').join('"');
            upDownData.push({key: propertyName, data: {status: subData}});
          }
        }

        setUpDownList(upDownData);
      } else if (dataResponse.type === 'WeatherResponse') {
        const weatherData = [];

        for (propertyName in dataResponse['subscriptionData']) {
          if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
            subData = dataResponse['subscriptionData'][propertyName].split('\\"').join('"');
            const weatherSubscriptionData = JSON.parse(subData);
            weatherData.push({key: propertyName, data: weatherSubscriptionData});
          }
        }

        setWeatherList(weatherData);
      } else if (dataResponse["command"] === 'remove' && (
        dataResponse.type === 'TickerCommand' ||
        dataResponse.type === 'UpDownCommand' ||
        dataResponse.type === 'WeatherCommand'))
      {
        if (dataResponse.type === 'TickerCommand') {
          setStockList(prevState => {
            return prevState.filter(item => item.key !== dataResponse["subscription"]);
          });
        } else if (dataResponse.type === 'UpDownCommand') {
          setUpDownList(prevState => {
            return prevState.filter(item => item.key !== dataResponse["subscription"]);
          });
        } else if (dataResponse.type === 'WeatherCommand') {
          setWeatherList(prevState => {
            return prevState.filter(item => item.key !== dataResponse["subscription"]);
          });
        }
      }
    };

    ws.onerror = evt => {
      writeToScreen('ERROR: ' + evt.data);
    };

    setWebsocket(ws);
  }, [setWebsocket, setWeatherList, setStockList, setUpDownList]);

  const authenticated = useCallback(username => {
    setClientName(username);
    setIsLoggedIn(true);
    startWebSocket();
  }, [startWebSocket, setClientName, setIsLoggedIn]);

  // const username = checkCookie();
  // if (username) {
  //   authenticated(username);
  // }

  const loginHandler = useCallback(async e => {
    e.preventDefault();
    const username = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    // This is now called when the user logs in
    const jsonBody = JSON.stringify({user: username, password: password});
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        'Content-Length': jsonBody.length
      },
      body: jsonBody
    });

    if (response.status === 200) {
      await response.json();
      authenticated(username);
    } else {
      alert(`Error: ${response.status}`);
    }
  }, [authenticated]);

  const removeSubscription = useCallback((data, subscriptionType) => {
    var message = `{"type":"${subscriptionType}", "id":"${clientName}", "command":"remove", "subscription":"${data}"}`;
    if (websocket) {
      websocket.send(message);
      writeToScreen("SENT: " + message);
    }
  }, [clientName, websocket]);

  const removeSubscriptionHandler = useCallback((e, subscriptionType) => {
    if (e) {
      e.preventDefault();
    }
    const data = e.currentTarget.getAttribute('data-key');
    removeSubscription(data, subscriptionType);
  }, [removeSubscription]);

  const removeStockHandler = useCallback(e => {
    if (e) {
      e.preventDefault();
    }
    removeSubscriptionHandler(e, 'TickerCommand');
  }, [removeSubscriptionHandler]);

  const removeUpDownHandler = useCallback(e => {
    if (e) {
      e.preventDefault();
    }
    removeSubscriptionHandler(e, 'UpDownCommand');
  }, [removeSubscriptionHandler]);

  const removeWeatherHandler = useCallback(e => {
    if (e) {
      e.preventDefault();
    }
    removeSubscriptionHandler(e, 'WeatherCommand');
  }, [removeSubscriptionHandler]);

  const logoutHandler = useCallback(async e => {
    if (e) {
      e.preventDefault();
    }

    setStockList(prevState => {
      prevState.forEach(item => removeSubscription(item.key, 'TickerCommand'));
      return prevState;
    });

    setUpDownList(prevState => {
      prevState.forEach(item => removeSubscription(item.key, 'UpDownCommand'));
      return prevState;
    });

    setWeatherList(prevState => {
      prevState.forEach(item => removeSubscription(item.key, 'WeatherCommand'));
      return prevState;
    });

    setIsLoggingOut(true);
  }, [removeSubscription]);

  if (isLoggingOut && !stockList.length && !upDownList.length && !weatherList.length) {
    setTimeout(async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=utf-8',
          'Content-Length': 2
        },
        body: {}
      });

      if (response.status === 200) {
        await response.json();
        setClientName(null);
        if (websocket) {
          websocket.close();
          setWebsocket(null);
        }
      } else {
        alert(`Error: ${response.status}`);
      }
    }, 1000);
  }

  return (
    <div className="app">
      <AppContext.Provider value={{
        isLoggedIn: isLoggedIn,
        websocket: websocket,
        clientName: clientName,
        loginHandler: loginHandler,
        logoutHandler: logoutHandler,
        removeStockHandler: removeStockHandler,
        removeUpDownHandler: removeUpDownHandler,
        removeWeatherHandler: removeWeatherHandler,
        stockList: stockList,
        upDownList: upDownList,
        weatherList: weatherList
      }}>
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
}

export default App;
