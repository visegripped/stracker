import React, { useContext } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import { AppContext } from "../../context/AppContext";
import useMessaging from "../../hooks/useMessaging";
import "./styles.css";

// heavily borrowed from https://dev.to/sivaneshs/add-google-login-to-your-react-apps-in-10-mins-4del

const clientId =
  "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

export const AuthButton = () => {
  const [App, setApp] = useContext(AppContext);
  const { addMessage } = useMessaging();
  const { tokenId } = App;

  const logout = () => {
    sessionStorage.setItem("tokenId", "");
    setApp({"tokenId": ""});
  };

  const setToken = (authResponse) => {
    const { tokenId, profileObj } = authResponse;
    const { email } = profileObj;
    sessionStorage.setItem("tokenId", tokenId);
    setApp({"tokenId": tokenId, "email": email});
  };

  const onLoginSuccess = (authResponse) => {
    console.log("Auth Success: currentUser:", authResponse);
    setToken(authResponse);
    refreshAuthTokenBeforeExpiration(authResponse);
  };

  const onLoginFailure = (authResponse) => {
    console.log(" - - - -- > authResponse: ", authResponse);
    addMessage(authResponse);
  };

  const onLogoutSuccess = (authResponse) => {
    console.log("Logout made successfully", authResponse);
    logout();
  };

  const refreshAuthTokenBeforeExpiration = (res) => {
    // Timing to renew access token
    let durationBetweenAutoRefresh =
      (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      console.log(" - - - > newAuthRes: ", newAuthRes);
      durationBetweenAutoRefresh =
        (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
      setToken(newAuthRes);
      setTimeout(refreshToken, durationBetweenAutoRefresh);
    };
    setTimeout(refreshToken, durationBetweenAutoRefresh);
  };

  return tokenId ? (
    <GoogleLogout
      clientId={clientId}
      buttonText="Logout"
      onLogoutSuccess={onLogoutSuccess}
    ></GoogleLogout>
  ) : (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login"
      onSuccess={onLoginSuccess}
      onFailure={onLoginFailure}
      cookiePolicy={"single_host_origin"}
      isSignedIn={true}
    />
  );
};

export default AuthButton;
