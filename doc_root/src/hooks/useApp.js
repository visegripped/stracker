import { useContext } from "react";
import AppContext from "../context/AppContext";

const useApp = () => {
  const context = useContext(AppContext);
  const [ app, setApp ] = context;
  return {app, setApp};
}

export default useApp;
