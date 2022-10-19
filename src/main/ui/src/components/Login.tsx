import { useCallback, useContext } from 'react';
import AppContext from '../store/app-context';

const Login = (): JSX.Element => {
  const ctx = useContext(AppContext);
  const { loginHandler } = ctx;

  const login = useCallback(
    (e: any) => {
      const username = document?.getElementById('user')?.value;
      const password = document?.getElementById('password')?.value;

      if (loginHandler) {
        loginHandler(e, username, password);
      }
    },
    [loginHandler]
  );

  return (
    <table>
      <tbody>
        <tr>
          <td className="left">Username</td>
          <td>
            <input id="user" type="text" size={40} />
          </td>
        </tr>
        <tr>
          <td className="left">Password</td>
          <td>
            <input id="password" type="password" size={40} />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>&nbsp;</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <button id="login" type="button" onClick={login}>
              Login
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Login;
