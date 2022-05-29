import { useContext } from "react";
import MessageContext from "../context/MessageContext";
import { v4 as uuidv4 } from 'uuid';

const useMessaging = () => {
  const context = useContext(MessageContext);
  const [ messages, setMessages ] = context;

  const removeMessage = (uuid) => {
    console.log( ' removeMessage: ', uuid);
    let updatedMessages = {...messages};
    delete updatedMessages[uuid];
    setMessages(updatedMessages);
  };

  const addMessage = (messageObj) => {
    const uuid = uuidv4();
    messages[uuid] = messageObj;
    setMessages(messages);
  };

  return { messages, addMessage, removeMessage };
}

export default useMessaging;