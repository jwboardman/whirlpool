const wsUri = "//" + window.location.hostname + ":8080/wswhirlpool";
let websocket;
let clientName;
let serverDown;

function init() {
  // auto-click login on enter only if the login div is visible
  document.onkeydown = function (evt) {
    const keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    if (keyCode === 13) {
      if (!document.getElementById("logindiv").classList.contains("hide")) {
        document.getElementById("login").click();
        return false;
      }
    } else {
      return true;
    }
  };

  checkCookie();
}

function authenticated(username) {
  clientName = username;
  const p = document.getElementById("current_user");
  p.innerHTML = "Logged in user: " + clientName;
  const ws = window.location.protocol === "http:" ? "ws:" : "wss:";
  startWebSocket(ws + wsUri);
  document.getElementById("logindiv").classList.add("hide");
  document.getElementById("maindiv").classList.remove("hide");
}

async function login(username, password) {
  const success = function (data) {
    serverDown = false;
    authenticated(username);
  };

  const error = function (error) {
    const json = JSON.parse(error);
    if (json) {
      alert(json.reason);
    } else {
      alert(error);
    }
  };

  // This is now called when the user logs in
  const jsonBody = JSON.stringify({ user: username, password: password });
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=utf-8",
      "Content-Length": jsonBody.length,
    },
    body: jsonBody,
  });

  if (response.status === 200) {
    success(await response.json());
  } else {
    error({ errorCode: response.status });
  }
}

function logout() {
  const success = function (data) {
    websocket.close();
  };

  const error = function (error) {
    const json = JSON.parse(error);
    if (json) {
      alert(json.reason);
    } else {
      alert(error);
    }
  };

  // This is now called when the user logs in
  ajax({
    type: "POST",
    url: "/api/logout",
    data: {},
    success: success,
    error: error,
  });
}

function startWebSocket(wsUrl) {
  websocket = new WebSocket(wsUrl);
  websocket.onopen = function (evt) {
    writeToScreen("CONNECTED");
  };

  websocket.onclose = function (evt) {
    writeToScreen("DISCONNECTED");
    document.getElementById("maindiv").classList.add("hide");
    document.getElementById("logindiv").classList.remove("hide");
    removeSelectOptions(document.getElementById("output"));
    removeSelectOptions(document.getElementById("stocklist"));
    removeSelectOptions(document.getElementById("updownlist"));
    removeSelectOptions(document.getElementById("weatherlist"));
    const p = document.getElementById("current_user");
    p.innerHTML = "";
  };

  websocket.onmessage = function (evt) {
    const data = evt.data;
    const dataResponse = JSON.parse(data);
    let subData;
    let option;
    let selectBox;
    let propertyName;

    writeToScreen("RESPONSE: " + data);

    if (dataResponse.type === "TickerResponse") {
      selectBox = document.getElementById("stocklist");

      for (propertyName in dataResponse["subscriptionData"]) {
        if (dataResponse["subscriptionData"].hasOwnProperty(propertyName)) {
          subData = dataResponse["subscriptionData"][propertyName]
            .split('\\"')
            .join('"');
          option = findSelectOption(selectBox, propertyName + ":");
          if (option) {
            option.text = propertyName + ": $" + subData;
          } else {
            option = document.createElement("option");
            option.text = propertyName + ": $" + subData;
            selectBox.add(option);
          }
        }
      }
    } else if (dataResponse.type === "UpDownResponse") {
      selectBox = document.getElementById("updownlist");

      for (propertyName in dataResponse["subscriptionData"]) {
        if (dataResponse["subscriptionData"].hasOwnProperty(propertyName)) {
          option = findSelectOption(selectBox, propertyName + ":");
          subData = dataResponse["subscriptionData"][propertyName]
            .split('\\"')
            .join('"');
          if (option) {
            option.text = propertyName + ": " + subData;
          } else {
            option = document.createElement("option");
            option.text = propertyName + ": " + subData;
            selectBox.add(option);
          }
        }
      }
    } else if (dataResponse.type === "WeatherResponse") {
      selectBox = document.getElementById("weatherlist");

      let weatherData;

      for (propertyName in dataResponse["subscriptionData"]) {
        if (dataResponse["subscriptionData"].hasOwnProperty(propertyName)) {
          subData = dataResponse["subscriptionData"][propertyName]
            .split('\\"')
            .join('"');
          weatherData = JSON.parse(subData);

          option = findSelectOption(selectBox, propertyName + ":");
          if (option) {
            if (weatherData["result"] === "notfound") {
              option.text = propertyName + ": not found";
            } else {
              option.text = propertyName + ": " + JSON.stringify(weatherData);
            }
          } else {
            option = document.createElement("option");

            if (weatherData["result"] === "notfound") {
              option.text = propertyName + ": not found";
            } else {
              option.text = propertyName + ": " + JSON.stringify(weatherData);
            }

            selectBox.add(option);
          }
        }
      }
    } else if (
      dataResponse.type === "TickerCommand" ||
      dataResponse.type === "UpDownCommand" ||
      dataResponse.type === "WeatherCommand"
    ) {
      if (dataResponse.type === "TickerCommand") {
        selectBox = document.getElementById("stocklist");
      } else if (dataResponse.type === "UpDownCommand") {
        selectBox = document.getElementById("updownlist");
      } else if (dataResponse.type === "WeatherCommand") {
        selectBox = document.getElementById("weatherlist");
      }

      if (dataResponse["command"] === "remove") {
        option = findSelectOption(
          selectBox,
          dataResponse["subscription"] + ":"
        );
        if (option) {
          selectBox.removeChild(option);
        }
      }
    }
  };

  websocket.onerror = function (evt) {
    serverDown = true;
    ws = null;
    writeToScreen('ERROR: ' + evt.data);
  };
}

function doSend(message) {
  websocket.send(message);
  writeToScreen("SENT: " + message);
}

function sendStockAdd(symbol) {
  doSend(
    '{"type":"TickerCommand", "id":"' +
      clientName +
      '", "command":"add", "subscription":"' +
      symbol +
      '"}'
  );
}

function sendStockRemove(symbol) {
  doSend(
    '{"type":"TickerCommand", "id":"' +
      clientName +
      '", "command":"remove", "subscription":"' +
      symbol +
      '"}'
  );
}

function sendUpDownAdd(url) {
  doSend(
    '{"type":"UpDownCommand", "id":"' +
      clientName +
      '", "command":"add", "subscription":"' +
      url +
      '"}'
  );
}

function sendUpDownRemove(url) {
  doSend(
    '{"type":"UpDownCommand", "id":"' +
      clientName +
      '", "command":"remove", "subscription":"' +
      url +
      '"}'
  );
}

function sendWeatherAdd(cityState) {
  doSend(
    '{"type":"WeatherCommand", "id":"' +
      clientName +
      '", "command":"add", "subscription":"' +
      cityState +
      '"}'
  );
}

function sendWeatherRemove(cityState) {
  doSend(
    '{"type":"WeatherCommand", "id":"' +
      clientName +
      '", "command":"remove", "subscription":"' +
      cityState +
      '"}'
  );
}

function writeToScreen(message) {
  const option = document.createElement("option");
  option.text = message;
  document.getElementById("output").add(option);
}

window.addEventListener("load", init, false);

function ajax(options) {
  let xmlhttp;

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
      if (xmlhttp.status === 200) {
        options.success(xmlhttp.responseText);
      } else if (xmlhttp.status === 400) {
        options.error("There was an error 400");
      } else if (xmlhttp.responseText) {
        options.error(xmlhttp.responseText);
      } else {
        options.error("Error " + xmlhttp.status + " was returned");
      }
    }
  };

  xmlhttp.open(options.type, options.url, true);

  if (options.type === "POST") {
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.send(JSON.stringify(options.data));
  } else {
    xmlhttp.send();
  }
}

function removeSelectOptions(selectbox) {
  let i;
  for (i = selectbox.options.length - 1; i >= 0; i--) {
    selectbox.remove(i);
  }
}

function findSelectOption(selectbox, optionTextStartsWith) {
  let i,
    options = selectbox.options;
  for (i = 0; i < options.length; i++) {
    if (options[i].value.indexOf(optionTextStartsWith) > -1) {
      return options[i];
    }
  }

  return undefined;
}

function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  const username = getCookie("whirlpool");
  if (username && !serverDown) {
    authenticated(username);
  }
}
