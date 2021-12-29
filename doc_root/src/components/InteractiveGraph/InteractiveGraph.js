import React from "react";
import { useState, useEffect } from "react";
import Chooser from "../PlotChooser/PlotChooser";
import Graph from "../Graph/Graph";
import styles from "./styles.css";

export const InteractiveGraph = ({ symbol, history }) => {
    useEffect(() => {
        console.log(`UseEffect for interactiveGraph was triggered.`);
        console.log(' -> history? ', history);
      }, [history]);
  const [dataPoints, setDataPoint] = useState({ EOD: true });
  const doStuff = (id, val) => {
    const updatedValue = { [id]: val };
    setDataPoint({
      ...dataPoints,
      ...updatedValue,
    });
  };
  return (
    <div>
      <section className={styles.mainCol}>
        <Graph symbol={symbol} enabledDataPoints={dataPoints} history={history} />
      </section>
      <section className={styles.sidebar}>
        <Chooser enabledDataPoints={dataPoints} clickHandler={doStuff} />
      </section>
    </div>
  );
};

export default InteractiveGraph;
