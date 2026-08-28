import React, { useState, createContext } from "react";
import { v4 as uuidv4 } from "uuid";

const NotificationsContext = createContext();

const NotificationsProvider = (props) => {
  const [notifications, setNotifications] = useState({});

  const removeNotification = (uuid) => {
    let updatedNotifications = { ...notifications };
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (notificationObj) => {
    let updatedNotifications = { ...notifications };
    const uuid = uuidv4();
    notificationObj.uuid = uuid; // add to the individual notification for easy lookup later.
    updatedNotifications[uuid] = notificationObj;
    setNotifications(updatedNotifications);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        removeNotification,
      }}
    >
      {props.children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext, NotificationsProvider };
export default NotificationsContext;
