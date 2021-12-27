import InteractiveGraph from './components/InteractiveGraph/InteractiveGraph';

function App() {
  const dataSets = ['EOD'];
  const symbol = 'AAPL';
  return (
    <div className="App">
      <header className="App-header">
        logo
      </header>
      <main>
      <InteractiveGraph symbol='AAPL' />
      </main>
    </div>
  );
}

export default App;


