import React, { useState, createContext } from "react";

const AuthContext = createContext();

function AuthProvider(props) {
  const [Auth, setAuth] = useState(true); //this should be false, eventually.
  return (
    <AuthContext.Provider value={[Auth, setAuth]}>
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
