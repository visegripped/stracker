import React, { useState, createContext } from "react";

const AppContext = createContext();

function AppProvider(props) {
  const accessToken = sessionStorage.getItem('accessToken') || undefined;
  const tokenId = sessionStorage.getItem('tokenId') || undefined;
  const [app, setApp] = useState({
    accessToken,
    tokenId,
    userEmail: '',
    messages: [],
  });
  const updateApp = (id, val) => {
    console.log(` - - -- - > updateApp. id = ${id} and val = ${val}`);
    const updatedValue = { [id]: val };
    const updatedApp = {
      ...app,
      ...updatedValue,
    };
    setApp(updatedApp);
  };
  return (
    <AppContext.Provider value={[app, updateApp]}>
      {props.children}
    </AppContext.Provider>
  );
}

const AppConsumer = AppContext.Consumer;

export { AppContext, AppProvider, AppConsumer };
export default AppContext;
