
import styles from './styles.css';

const Label = ({ id, clickHandler }) => {
    return <label className={styles.label}><input type='checkbox' onClick={(e) => clickHandler(id, e.target.checked)} /> { id }</label>
}

export const Chooser = ( { clickHandler, enabledDataPoints }) => {
    const dataPoints = ['EOD', 'MA20', 'MA50', 'delta', 'deltaMA5', 'deltaMA10', 'deltaMA20', 'P0', 'P1', 'P2', 'M1', 'M2', 'M3'];
    const labels = [];
    dataPoints.forEach((dataPoint) => {
        labels.push(<Label key={dataPoint} id={dataPoint} clickHandler={clickHandler} />);
    })
    return <fieldset>
        <legend>Data Points:</legend>
        {labels}
    </fieldset>
}

export default Chooser;
