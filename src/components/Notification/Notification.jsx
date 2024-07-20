import React, { useContext, useEffect, useState } from "react";
import "./Notification.css";
import useNotification from "@hooks/useNotification";

export const Notification = (props) => {
  const {type, message, uuid } = props;
  const { removeNotification } = useNotification();
  const handleClick = (clickEvent) => {
    removeNotification(uuid);
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
