import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.min.css'

export const DateRangePicker = (props) => {
  const { startDate, endDate, updateStartDate, updateEndDate } = props;
  const oldestDateInHistory = new Date("January 01, 2020 00:00:00"); // at some point, we could load this dynamically based on symbol.
  const today = new Date();
  return (
    <>
      <label className='flex'>
        <span className='fixedWidth'>Start:</span>
        <DatePicker
          maxDate={endDate}
          minDate={oldestDateInHistory}
          selectsStart
          endDate={endDate}
          selected={startDate}
          onChange={(date) => updateStartDate(date)}
        />
      </label>
      <label className='flex'>
        <span className='fixedWidth'>End:</span>
        <DatePicker
          maxDate={today} //can't choose a date in the future.
          minDate={startDate} //can't choose an end date before the start date
          selectsEnd
          startDate={startDate}
          selected={endDate}
          onChange={(date) => updateEndDate(date)}
        />
      </label>
    </>
  );
};

export default DateRangePicker;
