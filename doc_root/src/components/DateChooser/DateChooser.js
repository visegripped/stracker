import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DateChooser = (props) => {
  const { startDate, endDate, updateStartDate, updateEndDate } = props;
  const oldestDateInHistory = new Date("January 01, 2020 00:00:00"); // at some point, we could load this dynamically based on symbol.
  const today = new Date();
  return (
    <fieldset>
      <legend>Date Range:</legend>
      <label>
        Start Date:
        <DatePicker
          maxDate={endDate}
          minDate={oldestDateInHistory}
          selectsStart
          endDate={endDate}
          selected={startDate}
          onChange={(date) => updateStartDate(date)}
        />
      </label>
      <label>
        End Date:
        <DatePicker
          maxDate={today} //can't choose a date in the future.
          minDate={startDate} //can't choose a end date before the start date
          selectsEnd
          startDate={startDate}
          selected={endDate}
          onChange={(date) => updateEndDate(date)}
        />
      </label>
    </fieldset>
  );
};

export default DateChooser;
