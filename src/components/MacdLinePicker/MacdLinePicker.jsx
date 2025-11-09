const Label = ({ id, clickHandler, isChecked }) => {
  return (
    <label>
      <input
        type="checkbox"
        defaultChecked={isChecked}
        onClick={(e) => clickHandler(id, e.target.checked)}
      />{" "}
      {id}
    </label>
  );
};

export const MacdLinePicker = ({ clickHandler, enabledLines }) => {
  const lines = ["MACD", "Signal", "Histogram"];
  const labels = [];
  
  lines.forEach((line) => {
    labels.push(
      <Label
        key={line}
        id={line}
        clickHandler={clickHandler}
        isChecked={enabledLines[line]}
      />
    );
  });
  
  return <>{labels}</>;
};

export default MacdLinePicker;

