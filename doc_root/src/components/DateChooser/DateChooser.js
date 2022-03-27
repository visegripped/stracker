import "./styles.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DateChooser = (props) => {
  const { startDate, endDate, setStartDate, setEndDate } = props;
  const oldestDateInHistory = new Date("January 01, 2020 00:00:00"); // at some point, we could load this dynamically based on symbol.
  const today = new Date();
  return (
    <fieldset className="dateChooser--fieldset">
      <legend className="dateChooser--legend">Date Range:</legend>
      <label className="dateChooser--label">
        Start Date:
        <DatePicker
          maxDate={endDate}
          minDate={oldestDateInHistory}
          selectsStart
          endDate={endDate}
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
      </label>
      <label className="dateChooser--label">
        End Date:
        <DatePicker
          maxDate={today}  //can't choose a date in the future.
          minDate={startDate} //can't choose a end date before the start date
          selectsEnd
          startDate={startDate}
          selected={endDate}
          onChange={(date) => setEndDate(date)}
        />
      </label>
    </fieldset>
  );
};

export default DateChooser;
