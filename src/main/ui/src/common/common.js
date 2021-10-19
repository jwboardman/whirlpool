function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
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

function deleteCookie(name) {
  document.cookie = 'whirlpool=foo; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function writeToScreen(message) {
  console.log(message);
}

export {
  checkCookie,
  deleteCookie,
  writeToScreen
};