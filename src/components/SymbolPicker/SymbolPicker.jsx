'use client';

import "./SymbolPicker.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import apiPost from "../../utilities/apiPost";

const selectStyles = {
  option: (provided, state) => ({
    ...provided,
    fontSize: 14,
    textAlign: 'left',
    color: state.isSelected ? 'var(--color-text-inverse)' : 'var(--color-text)',
    backgroundColor: state.isSelected
      ? 'var(--color-accent)'
      : state.isFocused
        ? 'var(--color-bg-muted)'
        : 'transparent',
    cursor: 'pointer',
  }),
  control: (defaultStyles, state) => ({
    ...defaultStyles,
    backgroundColor: 'var(--color-input-bg)',
    color: 'var(--color-input-text)',
    padding: '4px 8px',
    minHeight: 48,
    border: `1px solid ${state.isFocused ? 'var(--color-accent)' : 'var(--color-border)'}`,
    borderRadius: 10,
    boxShadow: state.isFocused ? '0 0 0 3px var(--focus-ring)' : 'none',
  }),
  singleValue: (defaultStyles) => ({
    ...defaultStyles,
    color: 'var(--color-input-text)',
    fontWeight: 600,
  }),
  input: (defaultStyles) => ({
    ...defaultStyles,
    color: 'var(--color-input-text)',
  }),
  placeholder: (defaultStyles) => ({
    ...defaultStyles,
    color: 'var(--color-text-muted)',
  }),
  menu: (defaultStyles) => ({
    ...defaultStyles,
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 20,
  }),
  menuList: (defaultStyles) => ({
    ...defaultStyles,
    backgroundColor: 'var(--color-bg-elevated)',
  }),
  dropdownIndicator: (defaultStyles) => ({
    ...defaultStyles,
    color: 'var(--color-text-muted)',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
};

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
  
  return (
    <div className='symbolPicker-container'>
      <Select
        instanceId="symbol-picker"
        onChange={symbolChangeHandler}
        value={selectedOption}
        options={symbols}
        styles={selectStyles}
        classNamePrefix="symbol-select"
        aria-errormessage="symbolPickerErrors"
      />
      <div id='symbolPickerErrors'></div>
    </div>
  );
};

export default SymbolPicker;
