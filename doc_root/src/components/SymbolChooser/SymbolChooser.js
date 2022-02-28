
import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from "../../context/AppContext";
import Select from 'react-select'; // https://react-select.com/home
import apiEndpoints from '../../endpoints.json';

export const SymbolChooser = ({ symbolChangeHandler, symbol, symbolName }) => {
    let [symbols, setSymbols] = useState({});
    const [App, setApp] = useContext(AppContext);
    const { isAuthenticated } = App;
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
        const url = `${apiEndpoints.symbols}&token=${accessToken}`;
        fetch(url)
        .then(response => response.json())
        .then(data => {
          setSymbols(handleDataResponse(data));
        }).catch((e) => {
            setApp('messages', e);
        });
      },[symbol]);

    return <div>
        {isAuthenticated ? <Select onChange={symbolChangeHandler} defaultValue={selectedOption} options={symbols} /> : <></>}
    </div>
}

export default SymbolChooser;
