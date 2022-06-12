import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import useMessaging from "../../hooks/useMessaging";
import apiEndpoints from "../../endpoints.json";
import "./styles.css";

export const TrackButton = ({ symbol }) => {
  const { addMessage } = useMessaging();
  const [App] = useContext(AppContext);
  const { tokenId, userId } = App;
  const trackSymbol = () => {
    console.log(`-> trackSymbol was triggered for ${symbol}. tokenId is set: ${!!(tokenId)} and userId: ${userId}`);
    if(tokenId && userId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", "track");
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
          addMessage({ message: `Symbol ${symbol} is now being tracked`, classification: "info" });
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

  return  (
    <button
      onClick={trackSymbol}
      className="trackButton"
    >Track {symbol}</button>
  ) 
};

export default TrackButton;
