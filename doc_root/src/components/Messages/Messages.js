import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import './Messages.styles.css';

export const MessageTemplate = ({ classification, message}) => {
  return <div className={`message ${classification}`}>
      <pre className="message--pre">{message}</pre>
    <button className={`button message--button message--button--${classification}`}>X</button>
    </div>
}

export const Messages = () => {
  const [App, setApp] = useContext(AppContext);
  const { messages } = App;
  const messageList = []

  messages.forEach(({ message, classification }) => {
    messageList.push(<MessageTemplate message={message} classification={classification} />);
  })
    return <section className="messagesContainer">
      {messageList}
    </section>
}

export default Messages;
