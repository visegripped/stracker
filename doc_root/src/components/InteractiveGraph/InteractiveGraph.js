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
  const { isAuthenticated, messages, accessToken, tokenId } = App;
  const lsDataPoints = JSON.parse(localStorage.getItem("dataPoints")) || {
    EOD: true,
  };

  const lsStartDate = localStorage.getItem("startDate");
  const lsEndDate = localStorage.getItem("endDate");
  let defaultStartDate;

  if(lsStartDate) {
    defaultStartDate = new Date(`${lsStartDate}`);
  }
  else {
    defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  }
  const defaultEndDate = lsEndDate ? new Date(`${lsEndDate}`) : new Date();

  const formatDate = (date) => {
    const monthAdjustedForJS = date.getMonth() + 1;
    return `${date.getFullYear()}${monthAdjustedForJS.toString().padStart(2,'0')}${date.getDate()}`;
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

  const updateStartDate = (date) => {
    setStartDate(date)
    localStorage.setItem("startDate", date);
  }

  const updateEndDate = (date) => {
    setEndDate(date)
    localStorage.setItem("endDate", date);
  }

  useEffect(() => {
    if(accessToken) {
      const url = `${apiEndpoints.history}&symbol=${symbol}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
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
    }
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
        <DateChooser startDate={startDate} endDate={endDate} updateStartDate={updateStartDate} updateEndDate={updateEndDate} />
      </section></> : <h2>Please log in</h2>}
    </div>
  );
};

export default InteractiveGraph;
