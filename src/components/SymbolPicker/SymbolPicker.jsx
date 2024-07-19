import "./SymbolPicker.css";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // https://react-select.com/home
import apiPost from "../../utilities/apiPost";
import { AuthContext } from "../../context/AuthContext";

export const SymbolPicker = ({ symbol, symbolName }) => {
  const [Auth] = useContext(AuthContext);
  const { tokenId } = Auth;
  const navigate = useNavigate();
  let [symbols, setSymbols] = useState({});
  const selectedOption = {
    value: symbol,
    label: symbolName,
  };

  const handleDataResponse = (symbols = []) => {
    const data = [];
    symbols.forEach((symbol) => {
      const option = { value: symbol.symbol, label: symbol.name };
      data.push(option);
    });
    return data;
  };

  useEffect(() => {
    if (!symbols.length && tokenId) {
      const response = apiPost({ task: "symbols", tokenId });
      response &&
        response.then((data) => {
          setSymbols(handleDataResponse(data));
        });
    }
  }, []);

  const symbolChangeHandler = (event) => {
    const newSymbol = event.value;
    // const newSymbolName = event.label;
    navigate(`/symbol/${newSymbol}`);
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
        onChange={symbolChangeHandler}
        defaultValue={selectedOption}
        options={symbols}
        styles={customStyles}
        aria-errormessage="symbolPickerErrors"
      />
      <div id='symbolPickerErrors'></div>
    </div>
  );
};

export default SymbolPicker;
