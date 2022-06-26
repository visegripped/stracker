import InteractiveGraph from "./components/InteractiveGraph/InteractiveGraph";
import AlertHistory from "./components/AlertHistory/AlertHistory";
import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { MessageProvider } from "./context/MessageContext";
// import AuthButton from "./components/AuthButton/AuthButton";
import Messages from "./components/Messages";
import "./App.css";

function App() {
  const [view, setView] = useState(document.location.hash || "symbol");
  const changeView = (clickEvent) => {
    const newView = clickEvent.target.dataset.view;
    console.log(` -> Changing view to ${newView}`);
    setView(newView);
  };
  return (
    <div className="app">
      <AppProvider>
        <MessageProvider>
          <header className="appHeader">
            <div>
              <span className="app--logo">Stracker</span>
            </div>
            <nav className="app--nav">
              <li>
                <a href="#symbol" data-view="symbol" onClick={changeView}>
                  Symbol
                </a>
              </li>
              <li>
                <a
                  href="#alertHistory"
                  data-view="alertHistory"
                  onClick={changeView}
                >
                  Alert History
                </a>
              </li>
            </nav>
            <div>{/* <AuthButton /> */}</div>
          </header>

          <main>
            <Messages></Messages>
            {view === "alertHistory" ? <AlertHistory /> : <InteractiveGraph />}
          </main>
        </MessageProvider>
      </AppProvider>
    </div>
  );
}

export default App;
