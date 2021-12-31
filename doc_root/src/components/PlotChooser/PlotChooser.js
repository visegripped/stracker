
import './styles.css';

const Label = ({ id, clickHandler, isChecked }) => {
    return <label className='plotChooser--label'><input type='checkbox' defaultChecked={isChecked} onClick={(e) => clickHandler(id, e.target.checked)} /> { id }</label>
}

export const Chooser = ( { clickHandler, enabledDataPoints }) => {
    const dataPoints = ['EOD', 'MA20', 'MA50', 'delta', 'deltaMA5', 'deltaMA10', 'deltaMA20', 'M1', 'M2', 'M3'];
    const labels = [];
    dataPoints.forEach((dataPoint) => {
        labels.push(<Label key={dataPoint} id={dataPoint} clickHandler={clickHandler} isChecked={enabledDataPoints[dataPoint]} />);
    })
    return <fieldset className='plotChooser--fieldset'>
        <legend className='plotChooser--legend'>Data Points:</legend>
        {labels}
    </fieldset>
}

export default Chooser;
