import React, { useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
import './styles.css';

export const AuthButton = () => {
    const [Auth, setAuth] = useContext(AuthContext);
    const AuthText = (Auth) ? 'login' : 'logout';

    const toggleAuthState = (e) => {
		e.preventDefault();
		setAuth(!(Auth));
	}

    return (
      <button onClick={toggleAuthState}>
          {AuthText}
      </button>
    );
  };
  
  export default AuthButton;
  