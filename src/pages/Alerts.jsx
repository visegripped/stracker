import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import apiPost from "../utilities/apiPost";
import DateRangePicker from '../components/DateRangePicker';
import Fieldset from '../components/Fieldset';
import IndicatorPicker from '../components/IndicatorPicker';



const PageContent = (props) => {
  const {tokenId} = props;
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

  );
}

const Alerts = () => {
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;

  return (
    <>
      {tokenId ? (
        <PageContent tokenId={tokenId} />
      ) : (
        <h3>Please log in</h3>
      )}
    </>
  );

}

export default Alerts