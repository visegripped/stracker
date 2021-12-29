import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';
import SymbolChooser from './components/SymbolChooser';
import { useState } from 'react';

function App() {

  const [symbol, setSymbol ] = useState('');
  const [history, setHistory ] = useState([]);

  const changeSymbol =  (event) => {
      const newSymbol = event.value;
      setSymbol(newSymbol);
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
    <div className="App">
      <header className="App-header">
        <SymbolChooser symbolChangeHandler={changeSymbol} />
      </header>
      <main>
        <InteractiveGraph symbol={symbol} history={history} />
      </main>
    </div>
  );
}

export default App;


