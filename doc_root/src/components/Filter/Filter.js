import React, {useState} from "react";
import DateChooser from "../DateChooser";
import "./styles.css";
export const Filter = ({setNumAlertsToRetrieve, setAlertBytype}) => {

  const handleClickForLastAlerts = (clickEvent) => {
    clickEvent.preventDefault();
    const numAlerts = clickEvent?.target?.dataset?.alerts || 0;
    setNumAlertsToRetrieve(Number(numAlerts));
  }
  const handleChangeForType = (clickEvent) => {
    const isChecked = clickEvent.target.checked;
    const name = clickEvent.target.name;
    setAlertBytype(name,isChecked);
  }
  return (
    <div className="filter">
      <div className="filter--col">
        <ul className="filter--linkList">
          <li>
            <a href="#" onClick={handleClickForLastAlerts} data-alerts='20' className="filter--linkList-link">Last 20 alerts</a>
          </li>
          <li>
            <a href="#"  onClick={handleClickForLastAlerts} data-alerts='50' className="filter--linkList-link">Last 50 alerts</a>
          </li>
          <li>
            <a href="#"  onClick={handleClickForLastAlerts} data-alerts='100' className="filter--linkList-link">last 100 alerts</a>
          </li>
        </ul>
      </div>
      <div className="filter--col">
          <h3  className="filter--heading">Buy: </h3>
          <ul className="filter--checkList">
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p0-buy' /> P0</label></li>
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p1-buy' /> P1</label></li>
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p2-buy' /> P2</label></li>
          </ul>
        </div>
      <div className="filter--col">
          <h3  className="filter--heading">Sell: </h3>
          <ul className="filter--checkList">
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p0-sell' /> P0</label></li>
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p1-sell' /> P1</label></li>
            <li><label><input type='checkbox' onChange={handleChangeForType} name='p2-sell' /> P2</label></li>
          </ul>
        </div>
      {/* <div>
      <label><input type='checkbox' onChange={handleChangeForTrackedSymbols} name='trackedSymbolsOnly' /> Tracked</label>
      </div><div className="filter--col">
        <fieldset>
          <legend>Since:</legend>
          <div>Single date input</div>
        </fieldset>
      </div>
      <div className="filter--col">
        <DateChooser />
      </div> */}
    </div>
  );
};

export default Filter;
