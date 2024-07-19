import React, { useState, createContext } from "react";
const NotificationContext = createContext({
  notifications: {},
  setNotifications: () => {},
});
const NotificationConsumer = NotificationContext.Consumer;
const NotificationProvider = (props) => {
  const [notifications, setNotifications] = useState({});
  return (
    <NotificationContext.Provider value={[notifications, setNotifications]}>
      {props.children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider, NotificationConsumer };
export default NotificationContext;