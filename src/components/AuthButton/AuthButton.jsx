import React, { useContext, useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { AuthContext } from "@context/AuthContext";
import { NotificationsContext } from "@context/NotificationsContext";
import "./styles.css";

const clientId =
  "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

export const AuthButton = () => {
  const [Auth, setAuth] = useContext(AuthContext);
  const {addNotification} = useContext(NotificationsContext);

  const [access_token, setAccessToken] = useState('');
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
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
    setProfile(null);
  };

// https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses -> returned a 403.
// https://www.googleapis.com/auth/userinfo.email -> 200 response but CORS issue from localhost.

  const getProfile = async (access_token) => {
    // Fetch user profile information
    if(!access_token) {
      console.error('Access token was not passed to getProfile.  No request attempt has been made to retrieve the user profile');
      return;
    }
    try {
      const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
        headers: {
          Authorization: `Bearer ${access_token}` // this is the access_token.
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userProfile = await response.json();
      console.log('Profile:', userProfile);
      const emailAddress = userProfile?.emailAddresses[0]?.value;
      sessionStorage.setItem("userId", emailAddress);
      setAuth({ tokenId: access_token, userId: emailAddress });
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }


  const onLoginSuccess = (authResponse) => {
    console.log("Auth Success: authResponse:", authResponse);
    const { access_token } = authResponse;
    sessionStorage.setItem("tokenId", access_token);
    setAuth({ tokenId: access_token });
    setUser(authResponse); // probably not what we want here.  FIXME
    getProfile(access_token)
  };

  const onLoginFailure = (authResponse) => {
    console.log(" - - - -- > authResponse: ", authResponse);
    addNotification({
      message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
        authResponse
      )}`,
      type: "error",
    });
  };

  const onLogoutSuccess = (authResponse) => {
    console.log("Logout made successfully", authResponse);
    logout();
  };
// https://muhammedsahad.medium.com/react-js-a-step-by-step-guide-to-google-authentication-926d0d85edbd
  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: onLoginFailure,
    scope: 'openid profile email' // Include necessary scopes
  });

  return (
    <div>
      {tokenId ? (
        <div>
          {/* <img src={profile.picture} alt="user image" />
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email Address: {profile.email}</p>
          <br />
          <br /> */}
          <button onClick={onLogoutSuccess}>Sign out</button>
        </div>
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </div>
  );
};

export default AuthButton;
