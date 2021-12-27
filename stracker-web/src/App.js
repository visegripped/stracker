import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';
import SymbolChooser from './components/SymbolChooser';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <SymbolChooser />
      </header>
      <main>
        <InteractiveGraph symbol='AAPL' />
      </main>
    </div>
  );
}

export default App;


