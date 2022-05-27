import React from "react";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import apiEndpoints from "../../endpoints.json";
import "./Alerts.css";

export const Alerts = ({ symbol }) => {
  const [App] = useContext(AppContext);
  const { tokenId, messages } = App;
  const [ alertHistory, setAlertHistory ] = useState([]);
  
  useEffect(() => {
    if (tokenId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", "alerts");
      formData.append("symbol", symbol);
      fetch(apiEndpoints.root, {
        body: formData,
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(' - - - - -- > got to fetch', data)
          if (data.err) {
            messages.push({ message: data.err, classification: "error" });
          } else {
            setAlertHistory(data);
          }
        })
        .catch((err) => {
          messages.push({
            message: `Error requesting alerts: ${err}`,
            classification: "error",
          });
        });
    }
  }, [symbol, tokenId]);

  return (
    <fieldset>
      <legend>Alert History:</legend>
      <div className="alertContainer">
        {alertHistory.map((alert) => {
          return <div className="alertItem" key={alert.id}>{alert.date}: {alert.type}</div>
        })}
      </div>
    </fieldset>
  )
}
export default Alerts;