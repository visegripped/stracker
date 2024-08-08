import React, { useState, createContext, useEffect, useCallback } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google

const AuthContext = createContext();
const refreshTokenUrl = import.meta.env.VITE_REFRESH_TOKEN_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AuthProvider(props) {
  // console.log(' -> props from authProvider', props);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token") || ""
  );
  const [accessTokenExpiration, setAccessTokenExpiration] = useState(
    localStorage.getItem("access_token_expiration") || ""
  );

  const handleGoogleTokenExpiration = () => {
    let currentTime = new Date().getTime();
    const expirationTime = new Date(currentTime + 2 * 60 * 60 * 1000); // 2 hours for token life
    setAccessTokenExpiration(expirationTime);
    localStorage.setItem("access_token_expiration", expirationTime);
  }

  const onLoginSuccess = (authResponse) => {
    const { access_token, expiresIn, refresh_token } = authResponse;
    setAccessToken(access_token);
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    handleGoogleTokenExpiration();
  };

  const onLoginFailure = (authResponse) => {
    addNotification({
      message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
        authResponse
      )}`,
      type: "error",
    });
  };

  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: onLoginFailure,
    client_id: googleClientId,
    scope: "openid profile email",
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("tokenId");
    setAccessToken('');
    googleLogout();
  };

  const tokenIsValid = async () => {
    if (!accessToken) {
      return false;
    }
    const currentTime = new Date();
    if (currentTime >= accessTokenExpiration) {
      return false;
    }
    if (!validateTokenViaAPI()) {
      return false;
    }

    return true;
  };

  const validateTokenViaAPI = useCallback(async () => {
    if (!accessToken) return false;

    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" +
          accessToken
      );
      const data = await response.json();

      if (data.error_description) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [accessToken, accessTokenExpiration]);

  // const refreshToken = async () => {
  //   try {
  //     const response = await fetch(refreshTokenUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         refresh_token: localStorage.getItem("refresh_token"),
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log(' data from refreshToken', data)
  //     if (data.access_token) {
  //       localStorage.setItem("access_token", data.access_token);
  //       setAccessToken(data.access_token);
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error refreshing token:", error);
  //     return false;
  //   }
  // };

  useEffect(() => {
    if(!accessToken || !tokenIsValid()) {
      logout();
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ login, logout, accessToken, setAccessToken }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
export default AuthContext;
