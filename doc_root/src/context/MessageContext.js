import React, { useState, createContext } from "react";
const MessageContext = createContext({
  messages: {},
  setMessages: () => {},
});
const MessageConsumer = MessageContext.Consumer;
const MessageProvider = (props) => {
  const [messages, setMessages] = useState({});
  return (
    <MessageContext.Provider value={[messages, setMessages]}>
      {props.children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider, MessageConsumer };
export default MessageContext;
