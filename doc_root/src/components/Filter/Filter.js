import React from "react";
import DateChooser from "../DateChooser";
import "./styles.css";
export const Filter = ({setNumAlertsToRetrieve}) => {
  const handleClickForLastAlerts = (clickEvent) => {
    clickEvent.preventDefault();
    const numAlerts = clickEvent?.target?.dataset?.alerts || 0;
    setNumAlertsToRetrieve(Number(numAlerts));
  }
  return (
    <div className="filter">
      <div className="filter--col">
        <ul>
          <li>
            <a href="#" onClick={handleClickForLastAlerts} data-alerts='1'>Last alert</a>
          </li>
          <li>
            <a href="#"  onClick={handleClickForLastAlerts} data-alerts='5'>Last 5 alerts</a>
          </li>
          <li>
            <a href="#"  onClick={handleClickForLastAlerts} data-alerts='20'>last 20 alerts</a>
          </li>
        </ul>
      </div>
      <div className="filter--col">
        <h3>Since:</h3>
        Single date input
      </div>
      <div className="filter--col">
        <h3>Between:</h3>
        <DateChooser />
      </div>
    </div>
  );
};

export default Filter;
