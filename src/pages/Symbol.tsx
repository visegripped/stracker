import { useParams } from 'react-router-dom';
import DateRangePicker from '../components/DateRangePicker';
import Fieldset from '../components/Fieldset';
import Graph from '../components/Graph';
import SymbolPicker from '../components/SymbolPicker';

const Symbol = () => {
  let { symbol } = useParams();
  return (
    <>
    <section className='search-bar'>
      <SymbolPicker />
    </section>
    <section className="grid-container grid-sidebar">
      <div>

        <Fieldset legend="Data Points">EOD, MA20, etc</Fieldset>
        <Fieldset legend="Date Range"><DateRangePicker></DateRangePicker></Fieldset>
        <Fieldset legend="Alert History"> for symbol: {symbol} - truncate this.</Fieldset>

      </div>
      <div>
        <Graph />
      </div>
    </section>
    </>
  )

}

export default Symbol