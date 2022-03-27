import React from "react";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import PlotChooser from "../PlotChooser/PlotChooser";
import DateChooser from "../DateChooser/DateChooser";
import Graph from "../Graph/Graph";
import "./styles.css";
import apiEndpoints from "../../endpoints.json";

export const InteractiveGraph = ({ symbol, symbolName }) => {
  const [history, setHistory] = useState([]);
  const [App, setApp] = useContext(AppContext);
  const { isAuthenticated, messages } = App;
  const lsDataPoints = JSON.parse(localStorage.getItem("dataPoints")) || {
    EOD: true,
  };

  const lsStartDate = JSON.parse(localStorage.getItem("startDate"));
  const lsEndDate = JSON.parse(localStorage.getItem("endDate"));
  let defaultStartDate;

  if(lsStartDate) {
    defaultStartDate = new Date(`${lsStartDate}T00:00:00`);
  }
  else {
    defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  }
  const defaultEndDate = lsEndDate ? new Date(`${lsEndDate}T00:00:00`) : new Date();

  const formatDate = (date) => {
    return `${date.getFullYear()}${date.getMonth().toString().padStart(2,'0')}${date.getDate()}`;
  }

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
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
    const url = `${apiEndpoints.history}&symbol=${symbol}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
    console.log(' - - - - > url: ', url);
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
  }, [symbol, startDate, endDate]);

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
        <DateChooser startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      </section></> : <h2>Please log in</h2>}
    </div>
  );
};

export default InteractiveGraph;
