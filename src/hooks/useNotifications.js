import { UUID } from "uuidjs";
import { useContext } from "react";
import NotificationContext from "@context/NotificationContext";

const useNotification = () => {
  const context = useContext(NotificationContext);
  const [ messages, setNotifications ] = context;
  const uuid = UUID.generate();

  const removeNotification = (uuid) => {
    let updatedNotifications = {...messages};
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (messageObj) => {
    console.log(' -> Notification added: ', messageObj);
    const uuid = uuidv4();
    messages[uuid] = messageObj;
    setNotifications(messages);
  };

  return { messages, addNotification, removeNotification };
}

export default useNotification;