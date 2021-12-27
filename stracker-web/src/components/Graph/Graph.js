import React from 'react';
import styles from './styles.css';
// sample: https://codesandbox.io/s/tot3i?file=/src/App.js:92-496
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


  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

const colorMap = {
  'EOD' : 'red',
  'MA20' : 'blue',
  'MA50' : 'orange',
  'delta' : 'green',
  'deltaMA5' : 'brown',
  'deltaMA10' : 'purple',
  'deltaMA20' : 'teal',
  'M1' : 'black',
  'M2' : 'gold',
  'M3' : 'pink',
}

const getData = (enabledDataPoints = {EOD: true}) => {

  const formattedHistoricalData = formatHistoryAsDatasets(history);
  const datasets = [];
  const dataKeys = Object.keys(enabledDataPoints);
  dataKeys.forEach((dataPoint) => {
    if(enabledDataPoints[dataPoint]) {
      datasets.push({
        label: dataPoint,
        data: formattedHistoricalData[dataPoint],
        fill: false,
        borderColor: colorMap[dataPoint],
        backgroundColor: colorMap[dataPoint],
      })
    }
  })
  return {
    labels: formattedHistoricalData.date,
    datasets,
  };
}

export const Graph = ({symbol, enabledDataPoints }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
    display: true,
    position: "bottom",
    labels: {
      fontColor: "#323130",
      fontSize: 14
    }},
      title: {
        display: true,
        text: `History for ${symbol}`,
      },
    },
  };
  const data = getData(enabledDataPoints);
    return <div>
        <Line options={options} data={data} />
    </div>
}

export default Graph;