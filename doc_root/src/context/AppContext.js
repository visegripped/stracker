import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const accessToken = sessionStorage.getItem('accessToken') || undefined;
  console.log(' -> initial auth state: ', !!(accessToken));
  const [App, setApp] = useState({
    accessToken,
    isAuthenticated: !!(accessToken),
    messages: [],
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
