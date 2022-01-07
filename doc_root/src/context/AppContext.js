import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const [App, setApp] = useState({
    auth: false,
    messages: [],
  }); //this should be false, eventually.
  console.log(' - - - - - - > app: ', App);
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
