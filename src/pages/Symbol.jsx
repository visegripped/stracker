import { useParams } from "react-router-dom";
import DateRangePicker from "../components/DateRangePicker";
import Fieldset from "../components/Fieldset";
import Graph from "../components/Graph";
import SymbolPicker from "../components/SymbolPicker";
import PlotPicker from "../components/PlotPicker";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Symbol = () => {
  let { symbol } = useParams() || "AAPL";
  const [history, setHistory] = useState([]);
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;
  // console.log(`Token ID: ${tokenId}`);
  const dp = localStorage.getItem("dataPoints") || "{}";
  const lsDataPoints = JSON.parse(dp) || {
    EOD: true,
  };
  console.log(` -> lsDataPoints: `, lsDataPoints);

  // date uses session, not local. That way the dates reset between each visit.
  // Is a bit confusing when you log in and don't get the most recent data.
  const lsStartDate = sessionStorage.getItem("startDate") || "";
  const lsEndDate = sessionStorage.getItem("endDate") || "";
  let defaultStartDate;

  if (lsStartDate && lsStartDate !== "null") {
    defaultStartDate = new Date(lsStartDate);
  } else {
    defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  }
  const defaultEndDate =
    lsEndDate && lsEndDate !== "null" ? new Date(`${lsEndDate}`) : new Date();

  const formatDate = (date) => {
    const monthAdjustedForJS = (date.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const dayPadded = date.getDate().toString().padStart(2, "0");
    return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
  };

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [dataPoints, setDataPoints] = useState(lsDataPoints);
  const updateDataPoint = (id, val) => {
    console.log(` -> Got to updateDataPoint.  id: ${id} and val: ${val}`);
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
      fetch("https://visegripped.com/stracker/api.php", {
        body: formData,
        method: "post",
      })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw new Error(response.status);
          }
        })
        .then((data) => {
          console.log(`Historical data for ${symbol} was fetched`, data);
          if (data.err) {
            throw new Error(data.err);
          } else {
            setHistory(data);
          }
        })
        .catch((e) => {
          throw new Error(`The request to fetch the list of symbols has failed. Please try again later.
              If this error persists, contact the site administrator.
              Error details: ${e}`);
        });
    }
  }, [symbol, startDate, endDate, tokenId]); // The request always has all the data, so no need to trigger on dataPoints

  return (
    <>
      <section className="search-bar">
        <SymbolPicker />
      </section>
      <section className="grid-container grid-sidebar">
        <div>
          <Fieldset legend="Data Points">
            <PlotPicker
              clickHandler={updateDataPoint}
              enabledDataPoints={dataPoints}
            />
          </Fieldset>
          <Fieldset legend="Date Range">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              updateStartDate={updateStartDate}
              updateEndDate={updateEndDate}
            ></DateRangePicker>
          </Fieldset>
          <Fieldset legend="Alert History">
            {" "}
            for symbol: {symbol} - truncate this.
          </Fieldset>
        </div>
        <div>
          <Graph
            symbol={symbol}
            history={history}
            enabledDataPoints={lsDataPoints}
          />
        </div>
      </section>
    </>
  );
};

export default Symbol;
