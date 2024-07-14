import DateRangePicker from '../components/DateRangePicker';
import Fieldset from '../components/Fieldset';
import IndicatorPicker from '../components/IndicatorPicker';

const Alerts = () => {

  return (
    <section className="grid-container grid-sidebar">
      <div>
      <Fieldset legend="Max Results">
        <label><input type='number' max={200} value={50} name='limit' /></label>
      </Fieldset>
        <Fieldset legend="Indicators">
          <IndicatorPicker />
        </Fieldset>
        <Fieldset legend="Date Range"><DateRangePicker></DateRangePicker></Fieldset>

      </div>
      <div>
        content is king - an interactive table will go here.
      </div>
    </section>
  )

}

export default Alerts