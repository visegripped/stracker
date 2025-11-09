import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DateRangePicker,
  Fieldset,
  SymbolPicker,
  MacdLinePicker,
} from "../components";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Line } from "react-chartjs-2";
import "./Macd.css";
import apiPost from "../utilities/apiPost";
import { formatMACDData } from "../utilities/macdCalculations";

const MacdGraph = ({ symbol, macdData, enabledLines }) => {
  const datasets = [];

  // Prepare data for Chart.js
  const labels = macdData.map((row) => row.date);

  // MACD Line (blue)
  if (enabledLines.MACD) {
    datasets.push({
      label: "MACD",
      data: macdData.map((row) => row.MACD),
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgb(75, 192, 192)",
      tension: 0.1,
      type: "line",
    });
  }

  // Signal Line (orange)
  if (enabledLines.Signal) {
    datasets.push({
      label: "Signal",
      data: macdData.map((row) => row.Signal),
      fill: false,
      borderColor: "rgb(255, 159, 64)",
      backgroundColor: "rgb(255, 159, 64)",
      tension: 0.1,
      type: "line",
    });
  }

  // Histogram (bars - green/red)
  if (enabledLines.Histogram) {
    datasets.push({
      label: "Histogram",
      data: macdData.map((row) => row.Histogram),
      backgroundColor: macdData.map((row) =>
        row.Histogram >= 0 ? "rgba(75, 192, 75, 0.6)" : "rgba(255, 99, 132, 0.6)"
      ),
      borderColor: macdData.map((row) =>
        row.Histogram >= 0 ? "rgb(75, 192, 75)" : "rgb(255, 99, 132)"
      ),
      borderWidth: 1,
      type: "bar",
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#efefef",
          font: {
            size: 14,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      title: {
        display: true,
        text: `MACD for ${symbol}`,
        color: "#efefef",
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: "#efefef",
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: {
            top: 10,
          },
        },
        ticks: {
          color: "#efefef",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: 'MACD Value',
          color: "#efefef",
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: {
            right: 10,
          },
        },
        ticks: {
          color: "#efefef",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="macd-graph-container">
      <Line options={options} data={chartData} />
    </div>
  );
};

const MacdTable = ({ macdData }) => {
  const [colDefs] = useState([
    { field: "date", sortable: true, sort: "desc", width: 120 },
    { field: "EOD", sortable: true, width: 100 },
    {
      field: "MACD",
      sortable: true,
      width: 120,
      valueFormatter: (params) =>
        params.value !== null ? params.value.toFixed(4) : "N/A",
    },
    {
      field: "Signal",
      sortable: true,
      width: 120,
      valueFormatter: (params) =>
        params.value !== null ? params.value.toFixed(4) : "N/A",
    },
    {
      field: "Histogram",
      sortable: true,
      width: 120,
      valueFormatter: (params) =>
        params.value !== null ? params.value.toFixed(4) : "N/A",
      cellStyle: (params) => {
        if (params.value === null) return {};
        return params.value >= 0
          ? { color: "lightgreen" }
          : { color: "lightcoral" };
      },
    },
  ]);

  return (
    <div className="macd-table-container ag-theme-quartz-dark">
      <AgGridReact
        rowData={macdData}
        columnDefs={colDefs}
        domLayout="autoHeight"
      />
    </div>
  );
};

const PageContent = (props) => {
  const defaultSymbol =
    localStorage.getItem("mostRecentlyViewedSymbol") || "INTU";
  const { symbol = defaultSymbol } = props;
  const [history, setHistory] = useState([]);
  const [macdData, setMacdData] = useState([]);

  // MACD parameters with localStorage persistence
  const [fastPeriod, setFastPeriod] = useState(
    parseInt(localStorage.getItem("macdFastPeriod")) || 12
  );
  const [slowPeriod, setSlowPeriod] = useState(
    parseInt(localStorage.getItem("macdSlowPeriod")) || 26
  );
  const [signalPeriod, setSignalPeriod] = useState(
    parseInt(localStorage.getItem("macdSignalPeriod")) || 9
  );

  // Enabled lines with localStorage persistence
  const lsEnabledLines = localStorage.getItem("macdEnabledLines") || "{}";
  let defaultEnabledLines;
  try {
    defaultEnabledLines = JSON.parse(lsEnabledLines);
    if (!defaultEnabledLines || typeof defaultEnabledLines !== "object") {
      defaultEnabledLines = { MACD: true, Signal: true, Histogram: true };
    }
  } catch (error) {
    defaultEnabledLines = { MACD: true, Signal: true, Histogram: true };
  }

  const [enabledLines, setEnabledLines] = useState(defaultEnabledLines);

  // Date range with localStorage persistence
  const lsStartDate = localStorage.getItem("macdStartDate") || "";
  const lsEndDate = localStorage.getItem("macdEndDate") || "";
  
  let defaultStartDate;
  if (lsStartDate && lsStartDate !== "null") {
    const parsedStartDate = new Date(lsStartDate);
    defaultStartDate = isNaN(parsedStartDate.getTime()) ? new Date() : parsedStartDate;
    if (isNaN(defaultStartDate.getTime())) {
      defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 90);
    }
  } else {
    defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 90);
  }

  const defaultEndDate =
    lsEndDate && lsEndDate !== "null"
      ? (() => {
          const parsedEndDate = new Date(lsEndDate);
          return isNaN(parsedEndDate.getTime()) ? new Date() : parsedEndDate;
        })()
      : new Date();

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const updateEnabledLine = (id, val) => {
    const updatedLines = {
      ...enabledLines,
      [id]: val,
    };
    setEnabledLines(updatedLines);
    localStorage.setItem("macdEnabledLines", JSON.stringify(updatedLines));
  };

  const updateStartDate = (date) => {
    setStartDate(date);
    const dateStr = date instanceof Date ? date.toISOString() : date;
    localStorage.setItem("macdStartDate", dateStr);
  };

  const updateEndDate = (date) => {
    setEndDate(date);
    const dateStr = date instanceof Date ? date.toISOString() : date;
    localStorage.setItem("macdEndDate", dateStr);
  };

  const updateFastPeriod = (value) => {
    const period = parseInt(value) || 12;
    setFastPeriod(period);
    localStorage.setItem("macdFastPeriod", period.toString());
  };

  const updateSlowPeriod = (value) => {
    const period = parseInt(value) || 26;
    setSlowPeriod(period);
    localStorage.setItem("macdSlowPeriod", period.toString());
  };

  const updateSignalPeriod = (value) => {
    const period = parseInt(value) || 9;
    setSignalPeriod(period);
    localStorage.setItem("macdSignalPeriod", period.toString());
  };

  // Fetch history data (with buffer for MACD calculation)
  useEffect(() => {
    if (startDate && endDate && symbol) {
      // Calculate buffer needed: slowPeriod + signalPeriod + 5 extra days for safety
      const bufferDays = slowPeriod + signalPeriod + 5;
      
      // Calculate adjusted start date (with buffer for MACD calculation)
      const adjustedStartDate = new Date(startDate);
      adjustedStartDate.setDate(adjustedStartDate.getDate() - bufferDays);
      
      const response = apiPost({
        task: "history",
        symbol,
        startDate: adjustedStartDate,
        endDate,
      });
      response &&
        response
          .then((data) => {
            setHistory(Array.isArray(data) ? data : []);
          })
          .catch((error) => {
            console.error("Error fetching history:", error);
            setHistory([]);
          });
    }
  }, [symbol, startDate, endDate, slowPeriod, signalPeriod]);

  // Calculate MACD when history or parameters change
  useEffect(() => {
    if (history.length > 0) {
      const formatted = formatMACDData(
        history,
        fastPeriod,
        slowPeriod,
        signalPeriod
      );
      
      // Filter to only include rows where all MACD values are available (not null)
      // and within the user's selected date range
      const completeData = formatted.filter((row) => {
        const rowDate = new Date(row.date);
        const isInDateRange = rowDate >= startDate && rowDate <= endDate;
        const hasCompleteMACD = 
          row.MACD !== null && 
          row.Signal !== null && 
          row.Histogram !== null;
        return isInDateRange && hasCompleteMACD;
      });
      
      setMacdData(completeData);
    } else {
      setMacdData([]);
    }
  }, [history, fastPeriod, slowPeriod, signalPeriod, startDate, endDate]);

  // Store most recently viewed symbol
  useEffect(() => {
    if (symbol) {
      localStorage.setItem("mostRecentlyViewedSymbol", symbol);
    }
  }, [symbol]);

  return (
    <>
      <section className="search-bar">
        <SymbolPicker navigationBasePath="/macd" />
      </section>
      <section className="macd-container">
        <div className="macd-controls">
          <Fieldset legend="MACD Parameters">
            <div className="parameter-inputs">
              <label>
                Fast Period:
                <input
                  type="number"
                  value={fastPeriod}
                  onChange={(e) => updateFastPeriod(e.target.value)}
                  min="1"
                  max="100"
                />
              </label>
              <label>
                Slow Period:
                <input
                  type="number"
                  value={slowPeriod}
                  onChange={(e) => updateSlowPeriod(e.target.value)}
                  min="1"
                  max="100"
                />
              </label>
              <label>
                Signal Period:
                <input
                  type="number"
                  value={signalPeriod}
                  onChange={(e) => updateSignalPeriod(e.target.value)}
                  min="1"
                  max="100"
                />
              </label>
            </div>
          </Fieldset>
          <Fieldset legend="Display Options">
            <MacdLinePicker
              clickHandler={updateEnabledLine}
              enabledLines={enabledLines}
            />
          </Fieldset>
          <Fieldset legend="Date Range">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              updateStartDate={updateStartDate}
              updateEndDate={updateEndDate}
            />
            <div className="date-range-note">
              <small>Note: Additional historical data is automatically fetched for accurate MACD calculation</small>
            </div>
          </Fieldset>
        </div>
        <div className="macd-content">
          {macdData.length > 0 ? (
            <>
              <MacdGraph
                symbol={symbol}
                macdData={macdData}
                enabledLines={enabledLines}
              />
              <MacdTable macdData={macdData} />
            </>
          ) : (
            <h2>
              {history.length > 0 
                ? `Calculating MACD for ${symbol}. The selected date range may not have sufficient data for complete MACD calculation (requires ~34 days of history).`
                : `Loading MACD data for ${symbol}. Please ensure you have selected a valid date range with sufficient historical data.`
              }
            </h2>
          )}
        </div>
      </section>
    </>
  );
};

const Macd = () => {
  let { symbol } = useParams();
  return <PageContent symbol={symbol} />;
};

export default Macd;

