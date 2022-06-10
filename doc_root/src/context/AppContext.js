import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const tokenId = sessionStorage.getItem("tokenId") || undefined;
  const [App, setApp] = useState({
    tokenId,
  });
  const updateApp = (valObj) => {
    console.log(` - - -- > app updated for with `, valObj);
    const updatedApp = {
      ...App,
      ...valObj,
    };
    console.log(' - - - - - - > updateApp value: ', updatedApp);
    setApp(updatedApp);
  };
  return (
    <AppContext.Provider value={[App, updateApp]}>
      {props.children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
