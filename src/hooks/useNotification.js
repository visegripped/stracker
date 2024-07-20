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
    let updatedNotifications = {...notifications};
    const uuid = UUID.generate();
    notificationObj.uuid = uuid; // add to the individual notification for easy lookup later.
    updatedNotifications[uuid] = notificationObj;
    // console.log(' -> updatedNotifications: ', updatedNotifications);
    setNotifications(updatedNotifications);
  };

  return { notifications, addNotification, removeNotification };
}

export default useNotification;
