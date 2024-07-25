import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "@context/ProfileContext";
import apiPost from "@utilities/apiPost";
import { NotificationsContext } from "@context/NotificationsContext";

export const TrackButton = (props) => {
  const { symbol } = props;
  const { profile: userProfile } = useContext(ProfileContext);
  const { addNotification } = useContext(NotificationsContext);
  const [trackedSymbols, setTrackedSymbols] = useState([]);
  const [buttonAction, setButtonAction] = useState("Track");
  const { emailAddress } = userProfile;
  const handleClick = (clickEvent) => {
    if (emailAddress) {
      const response = apiPost({
        task: buttonAction.toLocaleLowerCase(),
        userId: emailAddress,
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
        }).catch((error) => {
          addNotification({
            message: 'Something went wrong. The symbol you were trying to track was not added to your list.  Please try again later.',
            type: "error",
            autoClear: false,
          });
        }) ;
    }
  };

  useEffect(() => {
    if (emailAddress && symbol) {
      const response = apiPost({
        task: "symbolIsTrackedByUser",
        userId: emailAddress,
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
