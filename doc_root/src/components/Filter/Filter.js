import React, {useState} from "react";
import DateChooser from "../DateChooser";
import "./styles.css";
export const Filter = ({setNumAlertsToRetrieve, alertTypesToRetrieve, setAlertTypesToRetrieve}) => {

  
  const handleClickForLastAlerts = (clickEvent) => {
    clickEvent.preventDefault();
    const numAlerts = clickEvent?.target?.dataset?.alerts || 0;
    setNumAlertsToRetrieve(Number(numAlerts));
  }
  const handleChangeForType = (clickEvent) => {
    const isChecked = clickEvent.target.checked;
    const name = clickEvent.target.name;
    const newAlertTypes = {...alertTypesToRetrieve};
    newAlertTypes[name] = isChecked;
    setAlertTypesToRetrieve(newAlertTypes);
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
        <fieldset>
          <legend>Types</legend>
          <h3>Buy</h3>
          <ul>
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p0buy' /> P0</label></li>
          </ul>
        </fieldset>
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
