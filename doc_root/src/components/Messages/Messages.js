
import './Messages.styles.css';

const MessageTemplate = ({ classification, message, state}) => {
  return <div className={`${classification} message`} aria-hidden={state === 'hidden' ? true: false}>
    {message}
    <button>X</button>
    </div>
}

export const Messages = () => {
    return <div>

    </div>
}

export default Messages;
