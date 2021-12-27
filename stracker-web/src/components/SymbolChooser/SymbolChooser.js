
import React from 'react';
import Select from 'react-select'; // https://react-select.com/home
import symbolJson from './sample.json';


const formatSymbols = (symbols = []) => {
    const data = [];
    symbols.forEach((symbol) => {
        data.push({value: symbol.symbol, label: symbol.name});
    });
    return data;
}

export const SymbolChooser = ({ symbolChangeHandler }) => {

    const options = formatSymbols(symbolJson.symbols);

    return <div>
        <Select onChange={symbolChangeHandler}  options={options} />
    </div>
}

export default SymbolChooser;
