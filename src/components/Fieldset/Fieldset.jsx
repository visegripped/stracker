import { Children } from "react";
import styles from './Fieldset.css';

export const Fieldset = (props) => {
  const { legend } = props;
  return (
    <fieldset>
      <legend>{legend}</legend>
      {Children}
    </fieldset>
  );
};
export default Fieldset;
