const getCookie = (cname: string): string => {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

const checkCookie = (): string => {
  return getCookie('whirlpool');
};

const deleteCookie = (): void => {
  document.cookie = 'whirlpool=foo; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

const writeToScreen = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

export { checkCookie, deleteCookie, writeToScreen };
