import React, { useState, createContext, useEffect, useCallback, useContext } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { NotificationsContext } from "./NotificationsContext";

const AuthContext = createContext();
const refreshTokenUrl = import.meta.env.VITE_REFRESH_TOKEN_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AuthProvider(props) {
  // console.log(' -> props from authProvider', props);
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenExpiration, setAccessTokenExpiration] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const { addNotification } = useContext(NotificationsContext);

  const handleGoogleTokenExpiration = () => {
    const currentTimeMs = Date.now();
    const expirationTimeMs = currentTimeMs + 2 * 60 * 60 * 1000; // 2 hours in ms
    setAccessTokenExpiration(expirationTimeMs);
    localStorage.setItem("access_token_expiration", String(expirationTimeMs));
  };

  const onLoginSuccess = (authResponse) => {
    const { access_token, expiresIn, refresh_token } = authResponse;
    setAccessToken(access_token);
    localStorage.setItem("access_token", access_token);
    if (refresh_token) {
      localStorage.setItem("refresh_token", refresh_token);
    }
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
    localStorage.removeItem("access_token_expiration");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("tokenId");
    setAccessToken("");
    setAccessTokenExpiration("");
    googleLogout();
  };

  const tokenIsValid = async () => {
    if (!accessToken) {
      return false;
    }
    const expirationMs = Number(accessTokenExpiration);
    if (!expirationMs || Number.isNaN(expirationMs)) {
      return false;
    }
    const nowMs = Date.now();
    if (nowMs >= expirationMs) {
      return false;
    }
    const apiOk = await validateTokenViaAPI();
    return apiOk;
  };

  const validateTokenViaAPI = useCallback(async () => {
    if (!accessToken) return false;

    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" +
          accessToken
      );
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();

      if (data.error_description) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [accessToken]);

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

  // Initial validation on mount
  useEffect(() => {
    let cancelled = false;
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token") || "";
      const storedExpiration = localStorage.getItem("access_token_expiration") || "";
      
      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      // Set state first to avoid showing wrong button
      setAccessToken(storedToken);
      setAccessTokenExpiration(storedExpiration);

      // Then validate
      const expirationMs = Number(storedExpiration);
      const isValidExpiration = expirationMs && !Number.isNaN(expirationMs) && Date.now() < expirationMs;
      
      if (!isValidExpiration) {
        if (!cancelled) {
          logout();
          setIsInitializing(false);
        }
        return;
      }

      // Validate with Google API
      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + storedToken
        );
        const data = await response.json();
        
        if (!cancelled) {
          if (data.error_description) {
            logout();
          }
          setIsInitializing(false);
        }
      } catch (error) {
        if (!cancelled) {
          logout();
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Validate token when it changes (after initial load)
  useEffect(() => {
    if (isInitializing) return; // Skip during initial validation
    
    let cancelled = false;
    const check = async () => {
      if (!accessToken) {
        return;
      }
      const ok = await tokenIsValid();
      if (!ok && !cancelled) {
        logout();
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [accessToken, isInitializing]);

  return (
    <AuthContext.Provider
      value={{ login, logout, accessToken, setAccessToken, isInitializing }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
export default AuthContext;
