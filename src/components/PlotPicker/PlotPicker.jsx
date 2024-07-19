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

export const PlotPicker = ({ clickHandler, enabledDataPoints }) => {
  const dataPoints = [
    "EOD",
    "M1",
    "M2",
    "M3",
    "MA20",
    "MA50",
    "delta",
    "deltaMA5",
    "deltaMA10",
    "deltaMA20",
  ];
  const labels = [];
  dataPoints.forEach((dataPoint) => {
    labels.push(
      <Label
        key={dataPoint}
        id={dataPoint}
        clickHandler={clickHandler}
        isChecked={enabledDataPoints[dataPoint]}
      />
    );
  });
  return <>{labels}</>;
};

export default PlotPicker;
