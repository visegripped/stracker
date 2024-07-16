import { useParams } from "react-router-dom";
import {
  DateRangePicker,
  Fieldset,
  Graph,
  SymbolPicker,
  PlotPicker,
} from "../components";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiPost from "../utilities/apiPost";

const PageContent = (props) => {
  const defaultSymbol =
    localStorage.getItem("mostRecentlyViewedSymbol") || "INTU";
  const { symbol = defaultSymbol, tokenId } = props;
  const [history, setHistory] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);

  // console.log(`Token ID: ${tokenId}`);
  const dp = localStorage.getItem("dataPoints") || "{}";
  const lsDataPoints = JSON.parse(dp) || {
    EOD: true,
  };

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
    if (startDate && endDate && tokenId && symbol) {
      const response = apiPost({
        tokenId,
        task: "history",
        symbol,
        startDate,
        endDate,
      });
      response &&
        response.then((data) => {
          setHistory(data);
        });
    }
  }, [symbol, startDate, endDate, tokenId]); // The response always has all the graph data, so no need to trigger on dataPoints change

  useEffect(() => {
    if (symbol && tokenId) {
      localStorage.setItem("mostRecentlyViewedSymbol", symbol);
      const response = apiPost({
        tokenId,
        task: "alerts",
        symbol,
        limit: 20,
      });

      response &&
        response.then((data) => {
          setAlertHistory(data);
        });
    }
  }, [symbol, tokenId]);

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
            {alertHistory.map((alert) => {
              return (
                <div className="alertItem" key={alert.id}>
                  {alert.date}: {alert.type}
                </div>
              );
            })}
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

const Symbol = () => {
  let { symbol } = useParams() || "AAPL";
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;

  return (
    <>
      {tokenId ? (
        <PageContent symbol={symbol} tokenId={tokenId} />
      ) : (
        <h3>Please log in</h3>
      )}
    </>
  );
};

export default Symbol;
