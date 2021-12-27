import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import history from './sample.json';


const formatHistoryAsDatasets = (history) => {
  const dataSets = {
    'date': [],
    'EOD': [],
    'MA20': [],
    'MA50': [],
    'delta': [],
    'deltaMA5': [],
    'deltaMA10': [],
    'deltaMA20': [],
    'P0': [],
    'P1': [],
    'P2': [],
    'M1': [],
    'M2': [],
    'M3': [],
  };
  history.forEach((row) => {
    dataSets['date'].push(row['date']);
    dataSets['EOD'].push(row['EOD']);
    dataSets['MA20'].push(row['MA20']);
    dataSets['MA50'].push(row['MA50']);
    dataSets['M1'].push(row['M1']);
    dataSets['M2'].push(row['M2']);
    dataSets['M3'].push(row['M3']);
    dataSets['delta'].push(row['delta']);
    dataSets['deltaMA5'].push(row['deltaMA5']);
    dataSets['deltaMA10'].push(row['deltaMA10']);
    dataSets['deltaMA20'].push(row['deltaMA20']);
    dataSets['P0'].push(row['P0']);
    dataSets['P1'].push(row['P1']);
    dataSets['P2'].push(row['P2']);
  });
  return dataSets;
}



function App() {

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const legend = {
    display: true,
    position: "bottom",
    labels: {
      fontColor: "#323130",
      fontSize: 14
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend,
      title: {
        display: true,
        text: 'Line Chart',
      },
    },
  };
  const dataSets = formatHistoryAsDatasets(history);
  console.log(' -> EOD: ', dataSets.EOD);
  const data = {
    labels: dataSets.date,
    datasets: [
      {
        label: "EOD",
        data: dataSets.EOD,
        fill: false,
        borderColor: "#990000",
        backgroundColor: "#990000"
      },
      {
        label: "M1",
        data: dataSets.M1,
        fill: false,
        borderColor: "#006600",
        backgroundColor: "#006600"
      }
    ]
  };

  return (
    <div className="App">
      <header className="App-header">
        logo
      </header>
      <main>
      <Line options={options} data={data} />
      </main>
    </div>
  );
}

export default App;
