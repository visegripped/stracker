import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';
import SymbolChooser from './components/SymbolChooser';
import Messages from './components/Messages';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const lsSymbol = localStorage.getItem('symbol') || '';
  const lsSymbolName = localStorage.getItem('symbolName') || '';
  const [symbol, setSymbol ] = useState(lsSymbol);
  const [symbolName, setSymbolName ] = useState(lsSymbolName);

  
  const changeSymbol =  (event) => {
      const newSymbol = event.value;
      const newSymbolName = event.label;
      setSymbol(newSymbol);
      setSymbolName(newSymbolName);
      localStorage.setItem('symbol', newSymbol);
      localStorage.setItem('symbolName', newSymbolName);
  };
  return (
    <div className="app">
      <header className="app--header">
        <div className='app--logo'>Stracker</div>
        <div className="app--symbolChooser">
          <SymbolChooser symbolChangeHandler={changeSymbol} symbol={symbol} symbolName={symbolName} />
        </div>
      </header>
      <main>
        <InteractiveGraph symbol={symbol} symbolName={symbolName}  />
      </main>
    </div>
  );
}

export default App;


