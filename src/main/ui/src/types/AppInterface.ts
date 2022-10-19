declare interface AppInterface {
  isLoggedIn: boolean;
  websocket: any;
  clientName: string;
  loginHandler: any;
  logoutHandler: any;
}

export default AppInterface;
