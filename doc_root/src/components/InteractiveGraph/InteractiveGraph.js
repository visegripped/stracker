import React from "react";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import PlotChooser from "../PlotChooser/PlotChooser";
import Graph from "../Graph/Graph";
import "./styles.css";
import apiEndpoints from "../../endpoints.json";

export const InteractiveGraph = ({ symbol, symbolName }) => {
  const [history, setHistory] = useState([]);
  const [App, setApp] = useContext(AppContext);
  const { isAuthenticated, messages, accessToken } = App;
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
    const url = `${apiEndpoints.history}&symbol=${symbol}&token=${accessToken}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Historical data for ${symbol} was fetched`);
        setHistory(data);
      })
      .catch((e) => {
        messages.push({
          message: `The request to fetch the list of symbols has failed. Please try again later.
          If this error persists, contact the site administrator.
          Error details: ${e}
          URL: ${url}`,
          classification: "error",
        });
        setApp('messages', messages);
      });
  }, [symbol]);

  return (
    <div className="interactiveGraph--Container">
      {isAuthenticated ? <><section className="interactiveGraph--mainCol">
        <Graph
          symbol={symbol}
          symbolName={symbolName}
          enabledDataPoints={dataPoints}
          history={history}
        />
      </section>
      <section className="interactiveGraph--sidebar">
        <PlotChooser
          enabledDataPoints={dataPoints}
          clickHandler={updateDataPoint}
        />
      </section></> : <h2>Please log in</h2>}
    </div>
  );
};

export default InteractiveGraph;
