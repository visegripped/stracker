import React from "react";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import useMessaging from "../../hooks/useMessaging";
import apiEndpoints from "../../endpoints.json";
import "./AlertHistory.css";

export const AlertHistory = ({ symbol }) => {
  const [App] = useContext(AppContext);
  const { addMessage } = useMessaging();
  const { tokenId } = App;
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    console.log(" WOOT !");
    if (tokenId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", "getAlertHistory");
      fetch(apiEndpoints.root, {
        body: formData,
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.err) {
            addMessage({ message: data.err, classification: "error" });
          } else {
            setAlertHistory(data);
          }
        })
        .catch((err) => {
          addMessage({
            message: `Error requesting alerts: ${err}`,
            classification: "error",
          });
        });
    }
  }, [symbol, tokenId]);

  return (
    <>
      <section className="app--menuBar">
        <div className="interactiveGraph--symbolChooser">date range picker</div>
        <div></div>
      </section>
      <section>
        <table className="alertHistory--table">
          <thead>
            <tr>
              <th className="alertHistory--th">Date</th>
              <th className="alertHistory--th">Symbol</th>
              <th className="alertHistory--th">Alert Type</th>
            </tr>
          </thead>
          <tbody>
            {alertHistory.map((row) => {
              return (
                <tr key={row.id}>
                  <td className="alertHistory--td">{row.date}</td>
                  <td className="alertHistory--td">{row.symbol}</td>
                  <td className="alertHistory--td">{row.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};
export default AlertHistory;
