import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import "./Messages.styles.css";

export const MessageTemplate = ({ classification, message, messageIndex, buttonOnclick }) => {
  const handleClick = () => {
    buttonOnclick(messageIndex);
  }
  return (
    <div className={`message ${classification}`}>
      <pre className="message--pre">{message}</pre>
      <button
        className={`button message--button message--button--${classification}`}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
};

export const Messages = () => {
  const [App, setApp] = useContext(AppContext);
  const { messages } = App;
  const messageList = [];

  const removeMessage = (index) => {
    if(index > -1) {
      messages.splice(index, 1);
    }
    setApp('messages', messages);
  };

  messages.forEach(({ message, classification }, index) => {
    messageList.push(
      <MessageTemplate
        messageIndex={index}
        key={`messageId-${index}`}
        message={message}
        classification={classification}
        buttonOnclick={removeMessage}
      />
    );
  });
  return <section className="messagesContainer">{messageList}</section>;
};

export default Messages;
