
import React from 'react';
import { useEffect, useState } from 'react';
import Select from 'react-select'; // https://react-select.com/home
import apiEndpoints from '../../endpoints.json';

export const SymbolChooser = ({ symbolChangeHandler, symbol, symbolName }) => {
    let [symbols, setSymbols] = useState({});
    const selectedOption = {
        value: symbol,
        label: symbolName,
    };

    const handleDataResponse = (symbols = []) => {
        const data = [];
        symbols.forEach((symbol) => {
            const option = {value: symbol.symbol, label: symbol.name};
            data.push(option);
        });
        return data;
    }

    useEffect(() => {
        console.log(' - fetch symbol list');
        fetch(apiEndpoints.symbols)
        .then(response => response.json())
        .then(data => {
          setSymbols(handleDataResponse(data));
        }).catch((e) => {
            console.log(' ERROR! ', e); // TODO -> need to handle this better.
        });
      },[symbol]);

    return <div>
        <Select onChange={symbolChangeHandler} defaultValue={selectedOption} options={symbols} />
    </div>
}

export default SymbolChooser;
