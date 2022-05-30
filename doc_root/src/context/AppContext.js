import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const tokenId = sessionStorage.getItem("tokenId") || undefined;
  const [App, setApp] = useState({
    tokenId,
  });
  const updateApp = (id, val) => {
    const updatedValue = { [id]: val };
    const updatedApp = {
      ...App,
      ...updatedValue,
    };
    setApp(updatedApp);
  };
  return (
    <AppContext.Provider value={[App, updateApp]}>
      {props.children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
