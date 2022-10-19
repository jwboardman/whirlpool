import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import InitialState from '../../types/InitialState';

const Login = (): JSX.Element => {
  const loginHandler = useSelector(
    (state: InitialState) => state.app.loginHandler
  );

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
