import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { AuthContext } from "../../context/AuthContext";
// import useNotification from "@hooks/useNotification";
import "./styles.css";

const clientId =
  "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

export const AuthButton = () => {
  const [Auth, setAuth] = useContext(AuthContext);
  // const { addNotification } = useNotification();
  const addNotification = (p) => {
    console.log(p);
  };
  const { tokenId } = Auth;

  const logout = () => {
    sessionStorage.setItem("tokenId", "");
    sessionStorage.setItem("userId", "");
    setAuth({ tokenId: "" });
    addNotification({
      message: "Thank you for your visit.  You have been logged out.",
      type: "info",
    });
    googleLogout();
  };

  const setToken = (authResponse) => {
    const { credential } = authResponse;
    sessionStorage.setItem("tokenId", tokenId);
    setAuth({ tokenId: credential });
  };

  const onLoginSuccess = (authResponse) => {
    console.log("Auth Success: currentUser:", authResponse);
    setToken(authResponse);
    refreshAuthTokenBeforeExpiration(authResponse);
    addNotification({
      message: "Thank you for your visit.  You are now logged in.",
      type: "info",
    });
  };

  const onLoginFailure = (authResponse) => {
    console.log(" - - - -- > authResponse: ", authResponse);
    addNotification({
      message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
        authResponse
      )}`,
      type: "info",
    });
  };

  const onLogoutSuccess = (authResponse) => {
    console.log("Logout made successfully", authResponse);
    logout();
  };

  // const refreshAuthTokenBeforeExpiration = (res) => {
  //   // Timing to renew access token
  //   let durationBetweenAutoRefresh =
  //     (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  //   const refreshToken = async () => {
  //     const newAuthRes = await res.reloadAuthResponse();
  //     console.log(" - - - > newAuthRes: ", newAuthRes);
  //     durationBetweenAutoRefresh =
  //       (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
  //     setToken(newAuthRes);
  //     setTimeout(refreshToken, durationBetweenAutoRefresh);
  //   };
  //   setTimeout(refreshToken, durationBetweenAutoRefresh);
  // };
  return (
    <GoogleLogin
      onSuccess={onLoginSuccess}
      onError={onLoginFailure}
      // useOneTap
      theme="filled_black"
      // size="medium"
    />
  );
};

export default AuthButton;
