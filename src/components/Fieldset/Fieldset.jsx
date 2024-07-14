import './Fieldset.css';

export const Fieldset = (props) => {
  const { legend, children } = props;
  return (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;
