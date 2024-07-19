import React, { useState, createContext } from "react";

const AuthContext = createContext();

function AuthProvider(props) {
  const tokenId = sessionStorage.getItem("tokenId") || undefined;
  const userId = sessionStorage.getItem("userId") || undefined;
  const [Auth, setAuth] = useState({
    tokenId,
    userId,
  });
  const updateAuth = (valObj) => {
    const updatedAuth = {
      ...Auth,
      ...valObj,
    };
    setAuth(updatedAuth);
  };
  return (
    <AuthContext.Provider value={[Auth, updateAuth]}>
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
