import React from "react";
import { useState, useEffect } from "react";
import Chooser from "../PlotChooser/PlotChooser";
import Graph from "../Graph/Graph";
import "./styles.css";
import apiEndpoints from '../../endpoints.json';

export const InteractiveGraph = ({ symbol, symbolName }) => {
  const [history, setHistory] = useState([]);
  const lsDataPoints = JSON.parse(localStorage.getItem("dataPoints")) || {
    EOD: true,
  };
  const [dataPoints, setDataPoints] = useState(lsDataPoints);
  const updateDataPoint = (id, val) => {
    const updatedValue = { [id]: val };
    const updatedDataPoints = {
      ...dataPoints,
      ...updatedValue,
    };
    setDataPoints(updatedDataPoints);
    localStorage.setItem("dataPoints", JSON.stringify(updatedDataPoints));
  };

  useEffect(() => {
    fetch(`${apiEndpoints.history}&symbol=${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Historical data for ${symbol} was fetched`);
        setHistory(data);
      })
      .catch((e) => {
        console.log(" ERROR! ", e); // TODO -> need to handle this better.
      });
  }, [symbol]);

  return (
    <div className="interactiveGraph--Container">
      <section className="interactiveGraph--mainCol">
        <Graph
          symbol={symbol}
          symbolName={symbolName}
          enabledDataPoints={dataPoints}
          history={history}
        />
      </section>
      <section className="interactiveGraph--sidebar">
        <Chooser
          enabledDataPoints={dataPoints}
          clickHandler={updateDataPoint}
        />
      </section>
    </div>
  );
};

export default InteractiveGraph;
