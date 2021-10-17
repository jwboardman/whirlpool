function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

function checkCookie() {
  return getCookie("whirlpool");
}

function writeToScreen(message) {
  var option = document.createElement("option");
  option.text = message;
  // document.getElementById("output").add(option);
}

export {
  checkCookie,
  writeToScreen
};