import { useContext } from 'react';
import AppContext from '../store/app-context';

const Login = () => {
  const ctx = useContext(AppContext);

  return (
    <table>
      <tbody>
        <tr>
          <td className="left">Username</td>
          <td><input id="user" type="text" size="40" /></td>
        </tr>
        <tr>
          <td className="left">Password</td>
          <td><input id="password" type="password" size="40" /></td>
        </tr>
        <tr>
          <td colSpan="2">
            &nbsp;
          </td>
        </tr>
        <tr>
          <td colSpan="2">
            <button id="login" onClick={ctx.loginHandler}>Login</button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Login;
