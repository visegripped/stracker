import React, { useContext, useEffect, useState } from "react";
import "./Notification.css";
import { NotificationsContext } from "@context/NotificationsContext";

export const Notification = (props) => {
  const {type, message, uuid, autoClear = true, autoClearDuration = 5000 } = props;
  const { removeNotification } = useContext(NotificationsContext);
  let wasManuallyCleared = false;

  const handleClick = (clickEvent) => {
    wasManuallyCleared = true;
    removeNotification(uuid);     
  };

  if(autoClear) {
    setTimeout(() => {
      if(!wasManuallyCleared) {
        removeNotification(uuid); 
      }
    }, autoClearDuration)
  }

  return (
    <div className={`notification ${type}`}>
      <pre className="notification--pre">{message}</pre>
      <button
        className={`notification--button ${type}`}
        data-uuid={uuid}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
};

export default Notification;
