import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const tokenId = sessionStorage.getItem("tokenId") || undefined;
  const userId = sessionStorage.getItem("userId") || undefined;
  const [App, setApp] = useState({
    tokenId,
    userId,
  });
  const updateApp = (valObj) => {
    const updatedApp = {
      ...App,
      ...valObj,
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
