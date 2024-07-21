import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiPost from "../utilities/apiPost";
// import DateRangePicker from "../components/DateRangePicker";
// import Fieldset from "../components/Fieldset";
// import IndicatorPicker from "../components/IndicatorPicker";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import "./Alerts.css";
import { Link } from "react-router-dom";
import PathConstants from "../routes/pathConstants";


const getSpanFromDiff = (EOD, earlier) => {
  if(isNaN(EOD) || isNaN(earlier)) return "";
  const diff = EOD - earlier;
  const className = diff >= 0 ? 'positive' : 'negative';
  return <span className={`price-${className}`}>{parseFloat(diff).toFixed(2)}</span>;
}

const LinkedSymbol = (props) => {
  const { value: symbol } = props;
  return <Link to={`${PathConstants.SYMBOL}/${symbol}`}>{symbol}</Link>;
};

const YTDSymbol = (props) => {
  const { value: symbol, yearStartDate, lastEOD } = props;
  return getSpanFromDiff(lastEOD, yearStartDate);
};
const DODSymbol = (props) => {
  const { value: symbol, previousDayEOD, lastEOD } = props.data;
  return getSpanFromDiff(lastEOD, previousDayEOD);
};

const Table = (props) => {
  const { alertHistory } = props;
  const [colDefs, setColDefs] = useState([
    { field: "symbol", sortable: true, cellRenderer: LinkedSymbol },
    { field: "name", flex: 2 },
    { field: "type", filter: "agSetColumnFilter" },
    { field: "lastEOD" },
    { field: "yearToDay", cellRenderer:YTDSymbol },
    { field: "dayOverDay", cellRenderer:DODSymbol },
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
  const { tokenId } = props;
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    if (tokenId && alertHistory.length === 0) {
      const response = apiPost({
        task: "getAlertHistoryList",
        tokenId,
        limit: 100,
      });
      response &&
        response.then((data) => {
          setAlertHistory(data);
        });
    }
  }, [tokenId]);
  //className="grid-container grid-sidebar"
  return (
    <section className="table-container ag-theme-quartz-dark">
      {/* <div>
        <Fieldset legend="Max Results">
          <label>
            <input type="number" max={200} defaultValue={50} name="limit" />
          </label>
        </Fieldset>
        <Fieldset legend="Indicators">
          <IndicatorPicker />
        </Fieldset>
        <Fieldset legend="Date Range">
          <DateRangePicker></DateRangePicker>
        </Fieldset>
      </div> */}
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
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;

  return (
    <>{tokenId ? <PageContent tokenId={tokenId} /> : <h3>Please log in</h3>}</>
  );
};

export default Alerts;
