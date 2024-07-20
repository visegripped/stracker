import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@context/AuthContext";
import "./TrackButton.css";
import apiPost from "@utilities/apiPost";
import useNotifications from "@hooks/useNotifications";

export const TrackButton = (props) => {
  const { symbol } = props;
  const [Auth] = useContext(AuthContext);

  const { tokenId, userId } = Auth;
  const [trackedSymbols, setTrackedSymbols] = useState([]);
  const [buttonAction, setButtonAction] = useState("Track");
  const { addNotification } = useNotifications();
  const handleClick = (clickEvent) => {
    // console.log(
    //   `-> trackButton handleClick was triggered for ${symbol}. tokenId is set: ${!!tokenId} and userId: ${userId} and buttonAction: ${buttonAction}`
    // );
    if (tokenId && userId) {
      const response = apiPost({
        tokenId,
        task: buttonAction.toLocaleLowerCase(),
        userId,
        symbol,
      });
      response &&
        response.then(() => {
          // set this before running setButtonAction so that the state is correct.
          const message =
            buttonAction === "Track"
              ? `You are now tracking ${symbol}`
              : `You are no longer tracking ${symbol}`;
          addNotification({
            message,
            type: "success",
          });
          setButtonAction(buttonAction === "Track" ? "Untrack" : "Track");
        });
    }
  };

  useEffect(() => {
    if (tokenId) {
      const response = apiPost({
        tokenId,
        task: "symbolIsTrackedByUser",
        userId,
        symbol,
      });
      response &&
        response.then((data) => {
          setButtonAction(data.isTracked ? "Untrack" : "Track"); // button has the opposite of what is currently set
        });
      response.catch((err) => {
        console.log(err);
      });
    }
  }, [tokenId, symbol]);

  return (
    <button onClick={handleClick} className="trackButton">
      {buttonAction} {symbol}
    </button>
  );
};

export default TrackButton;
