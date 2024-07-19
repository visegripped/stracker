import { UUID } from "uuidjs";
import { useContext } from "react";
import NotificationContext from "@context/NotificationContext";

const useNotification = () => {
  const context = useContext(NotificationContext);
  const [ notifications, setNotifications ] = context;
  const uuid = UUID.generate();

  const removeNotification = (uuid) => {
    let updatedNotifications = {...notifications};
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (notificationObj) => {
    console.log(' -> Notification added: ', notificationObj);
    const uuid = uuidv4();
    notifications[uuid] = notificationObj;
    setNotifications(notifications);
  };

  return { notifications, addNotification, removeNotification };
}

export default useNotification;