import React, { useState, createContext, useEffect, useCallback } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
const refreshTokenUrl = import.meta.env.VITE_REFRESH_TOKEN_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AuthProvider(props) {
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("access_token") || ""
  );

  const onLoginSuccess = (authResponse) => {
    const { access_token } = authResponse;
    sessionStorage.setItem("access_token", access_token);
    setAccessToken(access_token);
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
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("tokenId");
    setAccessToken(null);
    googleLogout();
  };

  const validateToken = useCallback(async () => {
    if (!accessToken) return false;

    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" +
          accessToken
      );
      const data = await response.json();

      if (data.error) {
        console.error("Token validation error:", data.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }, [accessToken]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(refreshTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: sessionStorage.getItem("refresh_token"),
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        sessionStorage.setItem("access_token", data.access_token);
        setAccessToken(data.access_token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }, []);

  const scheduleTokenRefresh = useCallback(
    (expiresIn) => {
      setTimeout(async () => {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = sessionStorage.getItem("access_token");
          const decodedToken = jwtDecode(newToken);
          const expiresIn = decodedToken.exp * 1000 - Date.now();
          scheduleTokenRefresh(expiresIn);
        } else {
          logout();
        }
      }, expiresIn - 60000); // Refresh 1 minute before expiration
    },
    [refreshToken, logout]
  );

  useEffect(() => {
    const initAuth = async () => {
      const valid = await validateToken();
      if (valid) {
        const decodedToken = jwtDecode(accessToken);
        const expiresIn = decodedToken.exp * 1000 - Date.now();
        scheduleTokenRefresh(expiresIn);
      } else {
        logout();
      }
    };

    if (accessToken) {
      initAuth();
    }
  }, [accessToken, validateToken, scheduleTokenRefresh, logout]);

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
