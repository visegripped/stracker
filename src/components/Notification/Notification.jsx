import React, { useContext, useEffect, useState } from "react";
import "./Notification.css";
import useNotification from "@hooks/useNotification";
import 'animate.css';

export const Notification = (props) => {
  // console.log('notification props:' , props)
  const {type, message, uuid, autoClear = true, autoClearDuration = 5000 } = props;
  const { removeNotification } = useNotification();
  const [ exitAnimationClassname , setExitAnimationClassname ] = useState('');
  let wasManuallyCleared = false;

  const closeNotification = () => {
    setExitAnimationClassname('animate__fadeInDown');
    setTimeout(() => {
      removeNotification(uuid);  
    }, 1); // give the animation time to run. set to 1 cuz animations not working. FIXME
  }

  const handleClick = (clickEvent) => {
    wasManuallyCleared = true;
    closeNotification();    
  };

  if(autoClear) {
    setTimeout(() => {
      if(!wasManuallyCleared) {
        closeNotification();
      }
    }, autoClearDuration)
  }


  return (
    <div className={`notification ${type} animate__fadeInDown ${exitAnimationClassname}`}>
      <pre className="notification--pre">{message}</pre>
      <button
        className={`notification--button .${type}`}
        data-uuid={uuid}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
};

export default Notification;
