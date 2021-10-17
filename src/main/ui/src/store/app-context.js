import React from 'react';

const AppContext = React.createContext({
  isLoggedIn: false,
  websocket: null,
  clientName: null,
  loginHandler: undefined,
  logoutHandler: undefined,
  stockList: [],
  upDownList: [],
  weatherList: []
});

export default AppContext;

