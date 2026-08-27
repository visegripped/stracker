'use client';

import { useRef } from 'react';
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useTheme } from '@context/ThemeContext';
import { getChartChrome } from '@utilities/chartTheme';

const formatHistoryAsDatasets = (history = []) => {
  const dataSets = {
    date: [],
    EOD: [],
    MA20: [],
    MA50: [],
    delta: [],
    deltaMA5: [],
    deltaMA10: [],
    deltaMA20: [],
    P0: [],
    P1: [],
    P2: [],
    M1: [],
    M2: [],
    M3: [],
  };

  if(history.length) {
    history.forEach((row) => {
      dataSets["date"].push(row["date"]);
      dataSets["EOD"].push(row["EOD"]);
      dataSets["MA20"].push(row["MA20"]);
      dataSets["MA50"].push(row["MA50"]);
      dataSets["M1"].push(row["M1"]);
      dataSets["M2"].push(row["M2"]);
      dataSets["M3"].push(row["M3"]);
      dataSets["delta"].push(row["delta"]);
      dataSets["deltaMA5"].push(row["deltaMA5"]);
      dataSets["deltaMA10"].push(row["deltaMA10"]);
      dataSets["deltaMA20"].push(row["deltaMA20"]);
      dataSets["P0"].push(row["P0"]);
      dataSets["P1"].push(row["P1"]);
      dataSets["P2"].push(row["P2"]);
    });
  }
  return dataSets;
};

const colorMap = {
  EOD: "#e53935",
  MA20: "#1e88e5",
  MA50: "#fb8c00",
  delta: "#43a047",
  deltaMA5: "#8d6e63",
  deltaMA10: "#8e24aa",
  deltaMA20: "#00897b",
  M1: "#039be5",
  M2: "#c9a227",
  M3: "#d81b60",
};

const getData = (enabledDataPoints = { EOD: true }, historicalData = []) => {
  const formattedHistoricalData = formatHistoryAsDatasets(historicalData);
  const datasets = [];
  const dataKeys = Object.keys(enabledDataPoints);
  dataKeys.forEach((dataPoint) => {
    if (enabledDataPoints[dataPoint]) {
      datasets.push({
        label: dataPoint,
        data: formattedHistoricalData[dataPoint],
        fill: false,
        borderColor: colorMap[dataPoint],
        backgroundColor: colorMap[dataPoint],
      });
    }
  });
  return {
    labels: formattedHistoricalData.date,
    datasets,
  };
};

export const Graph = ({ symbol, enabledDataPoints, history }) => {
  const { resolvedTheme } = useTheme();
  const formattedHistory = getData(enabledDataPoints, history);
  const options = {
    ...getChartChrome(resolvedTheme, `History for ${symbol}`, { x: 'Date', y: 'Price' }),
  };
  const ref = useRef();

  return (
    <div className="chart-card">
      <Line key={resolvedTheme} options={options} data={formattedHistory} ref={ref} />
    </div>
  );
};

export default Graph;
