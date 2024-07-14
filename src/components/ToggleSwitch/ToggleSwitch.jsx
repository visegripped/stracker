import "./ToggleSwitch.css";
 // https://www.geeksforgeeks.org/how-to-create-a-toggle-switch-in-react-as-a-reusable-component/

const ToggleSwitch = (props) => {
  const label = {props};
  return (
    <div className="container">
      {label}{" "}
      <div className="toggle-switch">
        <input type="checkbox" className="checkbox"
               name={label} id={label} />
        <label className="label" htmlFor={label}>
          <span className="inner" />
          <span className="switch" />
        </label>
      </div>
    </div>
  );
};
 
export default ToggleSwitch;