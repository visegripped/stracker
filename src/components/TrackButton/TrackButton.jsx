import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "@context/ProfileContext";
import "./TrackButton.css";
import apiPost from "@utilities/apiPost";
import { NotificationsContext } from "@context/NotificationsContext";

export const TrackButton = (props) => {
  const { symbol } = props;
  const { emailAddress } = useContext(ProfileContext);
  const { addNotification } = useContext(NotificationsContext);
  const [trackedSymbols, setTrackedSymbols] = useState([]);
  const [buttonAction, setButtonAction] = useState("Track");

  const handleClick = (clickEvent) => {
    // console.log(
    //   `-> trackButton handleClick was triggered for ${symbol} and emailAddress: ${emailAddress} and buttonAction: ${buttonAction}`
    // );
    if (emailAddress) {
      const response = apiPost({
        task: buttonAction.toLocaleLowerCase(),
        emailAddress,
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
    if (emailAddress && symbol) {
      const response = apiPost({
        task: "symbolIsTrackedByUser",
        emailAddress,
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
  }, [symbol, emailAddress]);

  return (
    <button onClick={handleClick} className="trackButton">
      {buttonAction} {symbol}
    </button>
  );
};

export default TrackButton;
