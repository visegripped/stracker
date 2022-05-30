import React from "react";
import useMessaging from "../../hooks/useMessaging";
import "./Messages.styles.css";

export const MessageTemplate = ({ classification, message, uuid }) => {
  const { removeMessage } = useMessaging();
  const handleClick = (clickEvent) => {
    const uuid = clickEvent.target.dataset.uuid;
    removeMessage(uuid);
  };
  return (
    <div className={`message ${classification}`}>
      <pre className="message--pre">{message}</pre>
      <button
        className={`button message--button message--button--${classification}`}
        data-uuid={uuid}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
};

export const Messages = () => {
  const { messages } = useMessaging();
  const messageList = [];
  const keys = Object.keys(messages);
  console.log(" -> rendering Messages");
  if (keys) {
    keys.forEach((uuid) => {
      const { message, classification } = messages[uuid];
      messageList.push(
        <MessageTemplate
          uuid={uuid}
          key={uuid}
          message={message}
          classification={classification}
        />
      );
    });
  }
  return <section className="messagesContainer">{messageList}</section>;
};

export default Messages;
