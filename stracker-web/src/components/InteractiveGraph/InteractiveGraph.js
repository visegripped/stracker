import React from 'react';
import { useState } from 'react';
import Chooser from '../Chooser/Chooser';
import Graph from '../Graph/Graph';
import styles from './styles.css';


export const InteractiveGraph = ({ symbol }) => {
    const [dataPoints, setDataPoint ] = useState({});
    const doStuff = ( id, val ) => {
        const updatedValue = { [id] : val };
        setDataPoint({
            ...dataPoints,
            ...updatedValue
        });
    }
    console.log(' -> this state: ', dataPoints );
    return <div>
        <section>
            <Graph symbol={symbol} enabledDataPoints={dataPoints} />
        </section>
        <section>
            <Chooser enabledDataPoints={dataPoints} clickHandler={doStuff} />
        </section>
    </div>
}

export default InteractiveGraph;