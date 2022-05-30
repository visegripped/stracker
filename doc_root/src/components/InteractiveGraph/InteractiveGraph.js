import React from "react";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import useMessaging from "../../hooks/useMessaging";
import PlotChooser from "../PlotChooser/PlotChooser";
import DateChooser from "../DateChooser/DateChooser";
import Graph from "../Graph/Graph";
import Alerts from "../Alerts/";
import "./styles.css";
import apiEndpoints from "../../endpoints.json";

export const InteractiveGraph = ({ symbol, symbolName }) => {
  const [history, setHistory] = useState([]);
  const [App, setApp] = useContext(AppContext);
  const { tokenId } = App;
  const { addMessage } = useMessaging();
  const lsDataPoints = JSON.parse(localStorage.getItem("dataPoints")) || {
    EOD: true,
  };
// date uses session, not local. That way the dates reset between each visit. 
// Is a bit confusing when you log in and don't get the most recent data.
  const lsStartDate = sessionStorage.getItem("startDate") || '';
  const lsEndDate = sessionStorage.getItem("endDate") || '';
  let defaultStartDate;

  if (lsStartDate && lsStartDate !== 'null') {
    defaultStartDate = new Date(lsStartDate);
  } else {
    defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  }
  const defaultEndDate = (lsEndDate && lsEndDate !== 'null') ? new Date(`${lsEndDate}`) : new Date();

  const formatDate = (date) => {
    const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, "0");
    const dayPadded = date.getDate().toString().padStart(2,'0');
    return `${date.getFullYear()}${monthAdjustedForJS
      }${dayPadded}`;
  };

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
    setStartDate(date);
    sessionStorage.setItem("startDate", date);
  };

  const updateEndDate = (date) => {
    setEndDate(date);
    sessionStorage.setItem("endDate", date);
  };

  useEffect(() => {
    if (tokenId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", "history");
      formData.append("symbol", symbol);
      formData.append("startDate", formatDate(startDate));
      formData.append("endDate", formatDate(endDate));
      console.log(`startDate: ${formatDate(startDate)} and endData: ${formatDate(endDate)}`);
      fetch(apiEndpoints.root, {
        body: formData,
        method: "post",
      })
        .then((response) => {
          if(response.status >= 200 && response.status < 300) {
            return response.json()
          } else {
            addMessage({ message: `Request to get historical data failed w/ error status ${response.status}`, classification: "error" });
          }
        })
        .then((data) => {
          console.log(`Historical data for ${symbol} was fetched`, data);
          if (data.err) {
            addMessage({ message: data.err, classification: "error" });
          } else {
            setHistory(data);
          }
        })
        .catch((e) => {
          addMessage({
            message: `The request to fetch the list of symbols has failed. Please try again later.
            If this error persists, contact the site administrator.
            Error details: ${e}`,
            classification: "error",
          });
        });
    }
  }, [symbol, startDate, endDate, tokenId]);

  return (
    <div className="interactiveGraph--Container">
      {tokenId ? (
        <>
          <section className="interactiveGraph--mainCol">
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
            <DateChooser
              startDate={startDate}
              endDate={endDate}
              updateStartDate={updateStartDate}
              updateEndDate={updateEndDate}
            />
            <Alerts
              symbol={symbol} />
          </section>
        </>
      ) : (
        <h2>Please log in</h2>
      )}
    </div>
  );
};

export default InteractiveGraph;
