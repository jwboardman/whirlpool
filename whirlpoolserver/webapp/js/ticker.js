var wsUri = "//" + window.location.hostname + ":8080/wsticker";
var websocket;
var clientName;

function init() {
    // auto-click login on enter only if the login div is visible
    document.onkeydown = function (evt) {
        var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
        if (keyCode == 13) {
            if (!document.getElementById("logindiv").classList.contains("hide")) {
                document.getElementById('login').click();
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
    var p = document.getElementById("current_user");
    p.innerHTML = "Logged in user: " + clientName;
    var ws = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
    startWebSocket(ws + wsUri);
    document.getElementById("logindiv").classList.add("hide");
    document.getElementById("maindiv").classList.remove("hide");
}

function login(username, password) {
    var success = function(data) {
        authenticated(username);
    };

    var error = function (error) {
        var json = JSON.parse(error);
        if (json) {
            alert(json.reason);
        } else {
            alert(error);
        }
    };

    // This is now called when the user logs in
    ajax({
        type: "POST",
        url: '/login',
        data: {user: username, password: password},
        success: success,
        error: error
    });
}

function logout() {
    var success = function(data) {
        websocket.close();
    };

    var error = function (error) {
        var json = JSON.parse(error);
        if (json) {
            alert(json.reason);
        } else {
            alert(error);
        }
    };

    // This is now called when the user logs in
    ajax({
        type: "POST",
        url: '/logout',
        data: {},
        success: success,
        error: error
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
        var p = document.getElementById("current_user");
        p.innerHTML = "";
    };

    websocket.onmessage = function (evt) {
        var data = evt.data;
        writeToScreen('<span style="color: blue;">RESPONSE: ' + data + '</span>');
        var dataResponse = JSON.parse(data),
            option,
            selectBox,
            propertyName;

        if (dataResponse.type === 'TickerResponse') {
            selectBox = document.getElementById("stocklist");

            for (propertyName in dataResponse['subscriptionData']) {
                if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
                    option = findSelectOption(selectBox, propertyName + ":");
                    if (option) {
                        option.text = propertyName + ': $' + dataResponse['subscriptionData'][propertyName];
                    } else {
                        option = document.createElement("option");
                        option.text = propertyName + ': $' + dataResponse['subscriptionData'][propertyName];
                        selectBox.add(option);
                    }
                }
            }
        } else if (dataResponse.type === 'UpDownResponse') {
            selectBox = document.getElementById("updownlist");

            for (propertyName in dataResponse['subscriptionData']) {
                if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
                    option = findSelectOption(selectBox, propertyName + ":");
                    if (option) {
                        option.text = propertyName + ': ' + dataResponse['subscriptionData'][propertyName];
                    } else {
                        option = document.createElement("option");
                        option.text = propertyName + ': ' + dataResponse['subscriptionData'][propertyName];
                        selectBox.add(option);
                    }
                }
            }
        } else if (dataResponse.type === 'WeatherResponse') {
            selectBox = document.getElementById("weatherlist");

            var weatherData;

            for (propertyName in dataResponse['subscriptionData']) {
                if (dataResponse['subscriptionData'].hasOwnProperty(propertyName)) {
                    weatherData = JSON.parse(dataResponse['subscriptionData'][propertyName]);

                    option = findSelectOption(selectBox, propertyName + ":");
                    if (option) {
                        if (weatherData["result"] === "notfound") {
                            option.text = propertyName + ': not found';
                        } else {
                            option.text = propertyName + ': temp=' + weatherData["temp"] + ', conditions=' + weatherData["text"];
                        }
                    } else {
                        option = document.createElement("option");

                        if (weatherData["result"] === "notfound") {
                            option.text = propertyName + ': not found';
                        } else {
                            option.text = propertyName + ': temp=' + weatherData["temp"] + ', conditions=' + weatherData["text"];
                        }

                        selectBox.add(option);
                    }
                }
            }
        } else if (dataResponse.type === 'TickerCommand' || dataResponse.type === 'UpDownCommand' || dataResponse.type === 'WeatherCommand') {
            if (dataResponse.type === 'TickerCommand') {
                selectBox = document.getElementById("stocklist");
            } else if (dataResponse.type === 'UpDownCommand') {
                selectBox = document.getElementById("updownlist");
            } else if (dataResponse.type === 'WeatherCommand') {
                selectBox = document.getElementById("weatherlist");
            }

            if (dataResponse["command"] === 'remove') {
                option = findSelectOption(selectBox, dataResponse["subscription"] + ":");
                if (option) {
                    selectBox.removeChild(option);
                }
            }
        }
    };

    websocket.onerror = function (evt) {
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    };
}

function doSend(message) {
    websocket.send(message);
    writeToScreen("SENT: " + message);
}

function sendStockAdd(symbol) {
    var message = '{"type":"TickerCommand", "id":"' + clientName + '", "command":"add", "subscription":"' + symbol + '"}';
    doSend(message);
}

function sendStockRemove(symbol) {
    var message = '{"type":"TickerCommand", "id":"' + clientName + '", "command":"remove", "subscription":"' + symbol + '"}';
    doSend(message);
}

function sendUpDownAdd(url) {
    var message = '{"type":"UpDownCommand", "id":"' + clientName + '", "command":"add", "subscription":"' + url + '"}';
    doSend(message);
}

function sendUpDownRemove(url) {
    var message = '{"type":"UpDownCommand", "id":"' + clientName + '", "command":"remove", "subscription":"' + url + '"}';
    doSend(message);
}

function sendWeatherAdd(cityState) {
    var message = '{"type":"WeatherCommand", "id":"' + clientName + '", "command":"add", "subscription":"' + cityState + '"}';
    doSend(message);
}

function sendWeatherRemove(cityState) {
    var message = '{"type":"WeatherCommand", "id":"' + clientName + '", "command":"remove", "subscription":"' + cityState + '"}';
    doSend(message);
}

function writeToScreen(message) {
    var option = document.createElement("option");
    option.text = message;
    document.getElementById("output").add(option);
}

window.addEventListener("load", init, false);

function ajax(options) {
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if (xmlhttp.status == 200) {
                options.success(xmlhttp.responseText);
            } else if (xmlhttp.status == 400) {
                options.error('There was an error 400');
            } else if (xmlhttp.responseText) {
                options.error(xmlhttp.responseText);
            } else {
                options.error('Error ' + xmlhttp.status + ' was returned');
            }
        }
    };

    xmlhttp.open(options.type, options.url, true);

    if (options.type == 'POST') {
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(JSON.stringify(options.data));
    } else {
        xmlhttp.send();
    }
}

function removeSelectOptions(selectbox) {
    var i;
    for (i = selectbox.options.length - 1; i >= 0; i--) {
        selectbox.remove(i);
    }
}

function findSelectOption(selectbox, optionTextStartsWith) {
    var i, options = selectbox.options;
    for (i = 0; i < options.length; i++) {
        if (options[i].value.indexOf(optionTextStartsWith) > -1) {
            return options[i];
        }
    }

    return undefined;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function checkCookie() {
    var username = getCookie("whirlpool");
    if (username) {
        authenticated(username);
    }
}
