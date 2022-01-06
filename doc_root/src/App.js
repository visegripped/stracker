import InteractiveGraph from "./components/InteractiveGraph/InteractiveGraph";
import SymbolChooser from "./components/SymbolChooser";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import AuthButton from "./components/AuthButton/AuthButton";
import "./App.css";

function App() {
  const lsSymbol = localStorage.getItem("symbol") || "";
  const lsSymbolName = localStorage.getItem("symbolName") || "";
  const [symbol, setSymbol] = useState(lsSymbol);
  const [symbolName, setSymbolName] = useState(lsSymbolName);

  const changeSymbol = (event) => {
    const newSymbol = event.value;
    const newSymbolName = event.label;
    setSymbol(newSymbol);
    setSymbolName(newSymbolName);
    localStorage.setItem("symbol", newSymbol);
    localStorage.setItem("symbolName", newSymbolName);
  };
  return (
    <div className="app">
      <AuthProvider>
        <header className="app--header">
          <div className="app--logo">Stracker</div>
          <div className="app--symbolChooser">
            <SymbolChooser
              symbolChangeHandler={changeSymbol}
              symbol={symbol}
              symbolName={symbolName}
            />
          </div>
          <div>
            <AuthButton />
          </div>
        </header>
        <main>
          <InteractiveGraph symbol={symbol} symbolName={symbolName} />
        </main>
      </AuthProvider>
    </div>
  );
}

export default App;
