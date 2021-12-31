import React from "react";
import { useState, useEffect } from "react";
import Chooser from "../PlotChooser/PlotChooser";
import Graph from "../Graph/Graph";
import "./styles.css";

export const InteractiveGraph = ({ symbol, history }) => {
  const lsDataPoints = JSON.parse(localStorage.getItem('dataPoints')) || {EOD: true};
  const [dataPoints, setDataPoints] = useState(lsDataPoints);
  const updateDataPoint = (id, val) => {
    const updatedValue = { [id]: val };
    const updatedDataPoints = {
      ...dataPoints,
      ...updatedValue,
    }
    setDataPoints(updatedDataPoints);
    localStorage.setItem('dataPoints', JSON.stringify(updatedDataPoints));
  };
  return (
    <div className="interactiveGraph--Container">
      <section className="interactiveGraph--mainCol">
        <Graph symbol={symbol} enabledDataPoints={dataPoints} history={history} />
      </section>
      <section className="interactiveGraph--sidebar">
        <Chooser enabledDataPoints={dataPoints} clickHandler={updateDataPoint} />
      </section>
    </div>
  );
};

export default InteractiveGraph;
