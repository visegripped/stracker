import React, { useContext, useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { AuthContext } from "../../context/AuthContext";
// import useNotifications from "@hooks/useNotifications";
import "./styles.css";

const clientId =
  "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

export const AuthButton = () => {
  const [Auth, setAuth] = useContext(AuthContext);
  // get and set user profile after a successful login.
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  // console.log(' -> useNotifications(): ', useNotifications())
  // const { addNotification } = useNotifications();

  const { tokenId } = Auth;

  const logout = () => {
    sessionStorage.setItem("tokenId", "");
    // sessionStorage.setItem("userId", "");
    setAuth({ tokenId: "" });
    // addNotification({
    //   message: "Thank you for your visit.  You have been logged out.",
    //   type: "info",
    // });
    googleLogout();
    setProfile(null);
  };

  const onLoginSuccess = (authResponse) => {
    console.log("Auth Success: authResponse:", authResponse);
    const { access_token } = authResponse;
    sessionStorage.setItem("tokenId", access_token);
    setAuth({ tokenId: access_token });
    // addNotification({
    //   message: "Thank you for your visit.  You are now logged in.",
    //   type: "info",
    // });
    setUser(authResponse);
  };

  const onLoginFailure = (authResponse) => {
    console.log(" - - - -- > authResponse: ", authResponse);
    // addNotification({
    //   message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
    //     authResponse
    //   )}`,
    //   type: "error",
    // });
  };

  const onLogoutSuccess = (authResponse) => {
    console.log("Logout made successfully", authResponse);
    logout();
  };
// https://muhammedsahad.medium.com/react-js-a-step-by-step-guide-to-google-authentication-926d0d85edbd
  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: onLoginFailure,
  });

  // useEffect(() => {
  //   if (user) {
  //     console.log(" -user ", user);
  //     sessionStorage.setItem("tokenId", user.access_token);
  //     fetch(
  //       `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${user.access_token}`,
  //           Accept: "application/json",
  //         },
  //       }
  //     )
  //       .then((res) => {
  //         setProfile(res.data);
  //         // console.log( ' --------> res', res);
  //       })
  //       .catch((err) => {
  //         // throw an error w/ a notification
  //         console.log(err);
  //       });
  //   }
  // }, [user]);
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
