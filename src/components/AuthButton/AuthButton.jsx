import React, { useContext, useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google"; // docs: https://www.npmjs.com/package/@react-oauth/google
import { AuthContext } from "@context/AuthContext";
import { ProfileContext } from "@context/ProfileContext";

export const AuthButton = () => {
  const { logout, login, accessToken = '', isInitializing = false } = useContext(AuthContext);
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

  // Don't show button state while validating initial auth
  if (isInitializing) {
    return null; // or return a loading spinner if preferred
  }

  return (
    <>
      {accessToken ? (
        <button onClick={() => authButtonLogout()}>Sign out</button>
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </>
  );
};

export default AuthButton;
