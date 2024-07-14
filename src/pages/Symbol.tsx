import { useParams } from 'react-router-dom';
// import DateRangePicker from '../components/DateRangePicker';

const Symbol = () => {
  let { symbol } = useParams();
  return (
    <section className="grid-container">
      <div className="grid-col grid-col-sidebar">
        left - {symbol}

IndicatorPicker
{/* <DateRangePicker></DateRangePicker> */}
Alert History for symbol - truncate this.

      </div>
      <div className="grid-col grid-col-main">
        main
      </div>
    </section>
  )

}

export default Symbol