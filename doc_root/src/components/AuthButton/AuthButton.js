import React from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import useApp from "../../hooks/useApp";
import "./styles.css";

// heavily borrowed from https://dev.to/sivaneshs/add-google-login-to-your-react-apps-in-10-mins-4del

const clientId =
  "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

export const AuthButton = () => {
  const { app, setApp } = useApp();
  const { tokenId } = app;

  const logout = () => {
    sessionStorage.setItem('tokenId', '');
    setApp("tokenId",'');
    // setApp("userEmail",'');
  }

  const setTokens = (authResponse) => {
    const { tokenId } = authResponse;
    sessionStorage.setItem('tokenId', tokenId);
    setApp("tokenId",tokenId);
  };

  const setUserData = (userDetail={}) => {
    const {email} = userDetail;
    console.log( ' - - - - - email: ', email);
    // setApp('userEmail', email);
  };

  const onLoginSuccess = (authResponse) => {
    console.log("Auth Success: currentUser:", authResponse);
    setTokens(authResponse);
    refreshAuthTokenBeforeExpiration(authResponse);
    setUserData(authResponse.profileObj);
  };

  const onLoginFailure = (authResponse) => {
    console.log(' - - - -- > authResponse: ', authResponse);
    // setApp('messages', authResponse);
  };

  const onLogoutSuccess = (authResponse) => {
    console.log('Logout made successfully', authResponse);
    logout();
  };

  const refreshAuthTokenBeforeExpiration = (res) => {
    // Timing to renew access token
    let durationBetweenAutoRefresh = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      durationBetweenAutoRefresh = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
      // sessionStorage.setItem('authToken', newAuthRes.id_token);
      setTokens(newAuthRes);
      setTimeout(refreshToken, durationBetweenAutoRefresh);
    };
    setTimeout(refreshToken, durationBetweenAutoRefresh);
  };

  return (
    tokenId ? 
    <GoogleLogout
        clientId={clientId}
        buttonText='Logout'
        onLogoutSuccess={onLogoutSuccess}
      ></GoogleLogout> : <GoogleLogin
      clientId={clientId}
      buttonText='Login'
      onSuccess={onLoginSuccess}
      onFailure={onLoginFailure}
      cookiePolicy={"single_host_origin"}
      isSignedIn={true}
    />
  );
};

export default AuthButton;
