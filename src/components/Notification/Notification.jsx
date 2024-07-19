import React, { useContext, useEffect, useState } from "react";
import "./Notification.css";
import useNotifications from "../../hooks/useNotifications"

export const Notification = (props) => {
  const {type, message } = props;
  const { removeNotification } = useNotifications();
  const handleClick = (clickEvent) => {
    const uuid = clickEvent.target.dataset.uuid;
    removeMessage(uuid);
  };
  return (
    <div className={`notification ${type}`}>
      <pre className="notification--pre">{message}</pre>
      <button
        className={`button notification--button notification--button--${type}`}
        data-uuid={uuid}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
};

export default Notification;
