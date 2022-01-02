
import React from 'react';
import { useEffect, useState } from 'react';
import Select from 'react-select'; // https://react-select.com/home
import apiEndpoints from '../../endpoints.json';

const formatSymbols = (symbols = []) => {
    const data = [];
    symbols.forEach((symbol) => {
        data.push({value: symbol.symbol, label: symbol.name});
    });
    return data;
}

export const SymbolChooser = ({ symbolChangeHandler }) => {
    let [symbols, setSymbols] = useState({});
    useEffect(() => {
        console.log(' -> useEffect for symbolChooser was triggered. endpoint: ', apiEndpoints.symbols)
        fetch(apiEndpoints.symbols)
        .then(response => response.json())
        .then(data => {
          setSymbols(formatSymbols(data));
        }).catch((e) => {
            console.log(' ERROR! ', e); // TODO -> need to handle this better.
        });
      },[]);

    return <div>
        <Select onChange={symbolChangeHandler}  options={symbols} />
    </div>
}

export default SymbolChooser;
