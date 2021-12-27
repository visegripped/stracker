import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';
import SymbolChooser from './components/SymbolChooser';
import { useState } from 'react';

function App() {

  const [symbol, setSymbol ] = useState('');
  const changeSymbol =  (event) => {
      setSymbol(event.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <SymbolChooser symbolChangeHandler={changeSymbol} />
      </header>
      <main>
        <InteractiveGraph symbol={symbol} />
      </main>
    </div>
  );
}

export default App;


