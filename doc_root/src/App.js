import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';
import SymbolChooser from './components/SymbolChooser';
import { useState } from 'react';
import './App.css';

function App() {
  const lsSymbol = localStorage.getItem('symbol') || '';
  const [symbol, setSymbol ] = useState(lsSymbol);
  const [history, setHistory ] = useState([]);

  
  const changeSymbol =  (event) => {
      const newSymbol = event.value;
      setSymbol(newSymbol);
      localStorage.setItem('symbol', newSymbol);
      fetch(`./api.php?task=history&symbol=${newSymbol}&ts=${Date.now()}`) // date is here to cache-bust
      .then((response) => response.json())
      .then((data) => {
        console.log(`Historical data for ${newSymbol} was fetched`);
        setHistory(data);
      })
      .catch((e) => {
        console.log(" ERROR! ", e); // TODO -> need to handle this better.
      });
  };
  return (
    <div className="app">
      <header className="app--header">
        <div className='app--logo'>Stracker</div>
        <div className="app--symbolChooser">
          <SymbolChooser symbolChangeHandler={changeSymbol} />
        </div>
      </header>
      <main>
        <InteractiveGraph symbol={symbol} history={history} />
      </main>
    </div>
  );
}

export default App;


