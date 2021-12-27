
import React from 'react';
import { useState } from 'react';
import Select from 'react-select'; // https://react-select.com/home
import symbolJson from './sample.json';


const formatSymbols = (symbols = []) => {
    const data = [];
    symbols.forEach((symbol) => {
        data.push({value: symbol.symbol, label: symbol.name});
    });
    return data;
}

export const SymbolChooser = () => {
    const [symbol, setSymbol ] = useState('');
    const changeSymbol =  (event) => {
        setSymbol(event.value);
    };
    const options = formatSymbols(symbolJson.symbols);

    return <div>
        <Select onChange={changeSymbol}  options={options} />
    </div>
}

export default SymbolChooser;
