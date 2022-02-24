import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import "./styles.css";

export const AuthButton = () => {
  const [App, setApp] = useContext(AppContext);
  const AuthText = App.auth ? "login" : "logout";

  const toggleAuthState = (e) => {
    e.preventDefault();
    setApp("auth", !App.auth);
  };

  return <button onClick={toggleAuthState}>{AuthText}</button>;
};

export default AuthButton;
