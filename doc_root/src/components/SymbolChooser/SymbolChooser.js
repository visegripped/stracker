import React from "react";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Select from "react-select"; // https://react-select.com/home
import apiEndpoints from "../../endpoints.json";

export const SymbolChooser = ({ symbolChangeHandler, symbol, symbolName }) => {
  let [symbols, setSymbols] = useState({});
  const [App] = useContext(AppContext);
  const { tokenId, messages } = App;
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
    if (tokenId) {
      let formData = new FormData();
      formData.append("tokenId", tokenId);
      formData.append("task", "symbols");
      fetch(apiEndpoints.root, {
        body: formData,
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.err) {
            messages.push({ message: data.err, classification: "error" });
          } else {
            setSymbols(handleDataResponse(data));
          }
        })
        .catch((err) => {
          messages.push({
            message: `Error requesting symbols: ${err}`,
            classification: "error",
          });
        });
    }
  }, [symbol, tokenId]);

  return (
    <div>
      {tokenId ? (
        <Select
          onChange={symbolChangeHandler}
          defaultValue={selectedOption}
          options={symbols}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default SymbolChooser;
