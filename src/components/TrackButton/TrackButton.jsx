import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./TrackButton.css";

export const TrackButton = (props) => {
  const { symbol } = props;     
  const { tokenId, userId } = useContext(AuthContext);
  const [trackedSymbols, setTrackedSymbols] = useState([]);
  const buttonAction =
    trackedSymbols && trackedSymbols?.includes(symbol) ? "Untrack" : "Track";

  useEffect(() => {
    if (tokenId && trackedSymbols.length === 0) {
      const response = apiPost({
        tokenId,
        task: "getTrackedSymbols",
        userId,
      });
      response &&
        response.then((data) => {
          setTrackedSymbols(data);
        });
    }
  }, [tokenId]);

  return (
    <button
      // onClick={handleClick}
      data-action={buttonAction.toLocaleLowerCase()}
      className="trackButton"
    >
      {buttonAction} {symbol}
    </button>
  );
};

export default TrackButton;
