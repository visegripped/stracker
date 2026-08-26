'use client';

import "./SymbolPicker.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select"; // https://react-select.com/home
import apiPost from "../../utilities/apiPost";

export const SymbolPicker = ({ symbol, symbolName, navigationBasePath = "/symbol" }) => {

  const router = useRouter();
  const [symbols, setSymbols] = useState([]);
  const selectedOption =
    symbols.find((s) => s.value === symbol) ??
    (symbol ? { value: symbol, label: symbolName || symbol } : null);

  const handleDataResponse = (rows = []) => {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      value: row.symbol,
      label: row.name || row.symbol,
    }));
  };

  useEffect(() => {
    const response = apiPost({ task: "symbols" });
    response &&
      response.then((data) => {
        setSymbols(handleDataResponse(data));
      }).catch((err) => {
        console.error("Error fetching symbols:", err);
      });
  }, []);

  const symbolChangeHandler = (event) => {
    const newSymbol = event.value;
    router.push(`${navigationBasePath}/${newSymbol}`);
  }
  
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      fontSize: 14,
      textAlign: 'left',
      color: 'black',
      backgroundColor: state.isSelected ? 'lightblue' : 'white', // Change background color for selected options
    }),
    control: (defaultStyles) => ({
      ...defaultStyles,
      // Notice how these are all CSS properties
      backgroundColor: "#212529",
      padding: "10px",
      border: "none",
      boxShadow: "none",
    }),
    singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#fff" }),
  };

  return (
    <div className='symbolPicker-container'>
      <Select
        instanceId="symbol-picker"
        onChange={symbolChangeHandler}
        value={selectedOption}
        options={symbols}
        styles={customStyles}
        aria-errormessage="symbolPickerErrors"
      />
      <div id='symbolPickerErrors'></div>
    </div>
  );
};

export default SymbolPicker;
