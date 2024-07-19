import "./IndicatorPicker.css";

export const IndicatorPicker = () => {
  return (
    <>
      <div>
        <h3 >Buy: </h3>
        <ul className="listitems">
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p0-buy"
              />{" "}
              P0
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p1-buy"
              />{" "}
              P1
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p2-buy"
              />{" "}
              P2
            </label>
          </li>
        </ul>
      </div>
      <div>
        <h3 >Sell: </h3>
        <ul className="listitems">
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p0-sell"
              />{" "}
              P0
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p1-sell"
              />{" "}
              P1
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                // onChange={handleChangeForType}
                name="p2-sell"
              />{" "}
              P2
            </label>
          </li>
        </ul>
      </div>
    </>
  );
};

export default IndicatorPicker;
