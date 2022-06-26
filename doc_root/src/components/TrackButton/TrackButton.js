import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import useMessaging from "../../hooks/useMessaging";
import apiEndpoints from "../../endpoints.json";
import "./styles.css";

export const TrackButton = ({ symbol = '' }) => {
  const { addMessage } = useMessaging();
  const [App] = useContext(AppContext);
  const { tokenId, userId } = App;
  const [ trackedSymbols, setTrackedSymbols ] = useState([]);
  const [ stateChangeTest, setStateChangeTest ] = useState(1);

  const getTrackedSymbols = () => {
    let formData = new FormData();
    formData.append("tokenId", tokenId);
    formData.append("task", "getTrackedSymbols");
    formData.append("userId", userId);
    return fetch(apiEndpoints.root, {
      body: formData,
      method: 'post',
    })  
    .then((response) => response.json())
    .then((data) => {
      setTrackedSymbols(data);
    })
    .catch((err) => {
      addMessage({
        message: `Error requesting alerts: ${err}`,
        classification: "error",
      });
    });
  }


  useEffect(() => {
    if(tokenId) {
      getTrackedSymbols();
    }
  }, [stateChangeTest]);

  const handleClick = (clickEvent) => {
    console.log(`-> trackSymbol was triggered for ${symbol}. tokenId is set: ${!!(tokenId)} and userId: ${userId}`);
    const trackStatus = clickEvent?.target?.dataset?.action || 'track';
    if(tokenId && userId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", trackStatus);
      formData.append("symbol", symbol);
      formData.append("userId", userId);
      fetch(apiEndpoints.root, {
        body: formData,
        method: 'post',
      })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        } else {
          addMessage({
            message: `Request to track symbol failed w/ error status ${response.status}`,
            classification: "error",
          });
        }
      })
      .then((data) => {
        if (data.err) {
          addMessage({ message: data.err, classification: "error" });
        } else {
        // success.  Throw success message.
          addMessage({ message: `Symbol ${symbol} is track status changed to: ${trackStatus}`, classification: "info" });
          setStateChangeTest(stateChangeTest+1);
        }
      })
      .catch((err) => {
        addMessage({
          message: `Error requesting track of ${symbol}: ${err}`,
          classification: "error",
        });
      });
    }
  }
  const buttonAction = (trackedSymbols?.indexOf(symbol) > -1) ? 'Track' : 'Untrack';
  return  (
    <button
      onClick={handleClick}
      data-action={buttonAction.toLocaleLowerCase()}
      className="trackButton"
    >{buttonAction} {symbol}</button>
  ) 
};

export default TrackButton;
