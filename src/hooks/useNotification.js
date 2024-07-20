import { UUID } from "uuidjs";
import { useContext } from "react";
import NotificationContext from "@context/NotificationContext";

const useNotification = () => {
  const context = useContext(NotificationContext);
  const [ notifications, setNotifications ] = context;

  const removeNotification = (uuid) => {
    let updatedNotifications = {...notifications};
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (notificationObj) => {
    console.log(' -> Notification added: ', notificationObj);
    let updatedNotifications = {...notificationObj};
    const uuid = UUID.generate();
    updatedNotifications[uuid] = notificationObj;
    console.log(' -> ')
    setNotifications(updatedNotifications);
  };

  return { notifications, addNotification, removeNotification };
}

export default useNotification;
