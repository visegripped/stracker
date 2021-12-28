
import React from 'react';
import { useEffect, useState } from 'react';
import Select from 'react-select'; // https://react-select.com/home

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
        fetch("/stracker/api.php?task=symbols")
        .then(response => response.json())
        .then(data => {
          setSymbols(formatSymbols(data));
        }).catch((e) => {
            console.log(' ERROR! ', e); // need to handle this better.
        });
      },[]);

    return <div>
        <Select onChange={symbolChangeHandler}  options={symbols} />
    </div>
}

export default SymbolChooser;
