import React, { useContext, useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { AuthContext } from "@context/AuthContext";
import { ProfileContext } from "@context/ProfileContext";

export const AuthButton = () => {
  const { logout, login, accessToken } = useContext(AuthContext);
  const { setProfile, fetchProfile, profile } = useContext(ProfileContext);

  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(profile).length === 0) {
      fetchProfile(accessToken);
    }
  }, [accessToken]);

  const authButtonLogout = () => {
    logout();
    setProfile({});
  }

  return (
    <>
      {accessToken ? (
        <button className='authButton authButton--signout' onClick={() => authButtonLogout()}>Sign out</button>
      ) : (
        <button className='authButton authButton--signout' onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </>
  );
};

export default AuthButton;
