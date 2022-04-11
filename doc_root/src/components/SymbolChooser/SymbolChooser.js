
import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from "../../context/AppContext";
import Select from 'react-select'; // https://react-select.com/home
import apiEndpoints from '../../endpoints.json';

export const SymbolChooser = ({ symbolChangeHandler, symbol, symbolName }) => {
    let [symbols, setSymbols] = useState({});
    const [App] = useContext(AppContext);
    const { isAuthenticated, tokenId } = App;
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
        if(tokenId) {
            fetch(`${apiEndpoints.symbols}`)
            .then(response => response.json())
            .then(data => {
              setSymbols(handleDataResponse(data));
            }).catch((e) => {
                console.log(' ERROR! ', e); // TODO -> need to handle this better.
            });
        }
      },[symbol]);

    return <div>
        {isAuthenticated ? <Select onChange={symbolChangeHandler} defaultValue={selectedOption} options={symbols} /> : <></>}
    </div>
}

export default SymbolChooser;
