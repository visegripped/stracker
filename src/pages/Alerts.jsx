import { useState, useEffect, useContext } from "react";
import apiPost from "../utilities/apiPost";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import "./Alerts.css";
import { Link } from "react-router-dom";
import PathConstants from "../routes/pathConstants";

const getSpanFromDiff = (EOD, earlier) => {
  console.log(`EOD: ${EOD} and yearStart: ${earlier}`)
  if (isNaN(EOD) || isNaN(earlier) || !earlier || !EOD) return "";
  const diff = EOD - earlier;
  const className = diff >= 0 ? "positive" : "negative";
  return (
    <span className={`price-${className}`}>{parseFloat(diff).toFixed(2)}</span>
  );
};

const LinkedSymbol = (props) => {
  const { value: symbol } = props;
  return <Link to={`${PathConstants.SYMBOL}/${symbol}`}>{symbol}</Link>;
};

const YTDSymbol = (props) => {
  const { yearStartEOD, lastEOD } = props.data;
  return getSpanFromDiff(lastEOD, yearStartEOD);
};
const DODSymbol = (props) => {
  const { previousDayEOD, lastEOD } = props.data;
  return getSpanFromDiff(lastEOD, previousDayEOD);
};

const Table = (props) => {
  const { alertHistory } = props;
  const [colDefs, setColDefs] = useState([
    { field: "symbol", sortable: true, cellRenderer: LinkedSymbol },
    { field: "name", flex: 2 },
    { field: "type", filter: "agSetColumnFilter" },
    { field: "lastEOD", headerName: "EOD" },
    { field: "yearStartEOD", cellRenderer: YTDSymbol, headerName: "Year to EOD" },
    { field: "dayOverDay", cellRenderer: DODSymbol },
    { field: "date", sort: "asc" },
  ]);

  return (
    <>
      <AgGridReact
        rowData={alertHistory}
        columnDefs={colDefs}
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
};

const PageContent = (props) => {
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    if (alertHistory.length === 0) {
      const response = apiPost({
        task: "getAlertHistoryList",
        limit: 100,
      });
      response &&
        response.then((data) => {
          setAlertHistory(data);
        });
    }
  }, [alertHistory]);
  //className="grid-container grid-sidebar"
  return (
    <section className="table-container ag-theme-quartz-dark">
      <>
        {alertHistory.length ? (
          <Table alertHistory={alertHistory} />
        ) : (
          <h3>Fetching data...</h3>
        )}
      </>
    </section>
  );
};

const Alerts = () => {
  return <PageContent />;
};

export default Alerts;
