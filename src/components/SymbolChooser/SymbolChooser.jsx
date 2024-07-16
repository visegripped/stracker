import React from "react";
import { useEffect, useState, useContext } from "react";
// import { AppContext } from "../../context/AppContext";
// import useMessaging from "../../../doc_root/src/hooks/useMessaging";

// import apiEndpoints from "../../../doc_root/src/endpoints.json";

export const SymbolChooser = ({ symbolChangeHandler, symbol, symbolName }) => {
  let [symbols, setSymbols] = useState({});
  const [App] = useContext(AppContext);
  // const { addMessage } = useMessaging();
  const { tokenId } = App;
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
      fetch("NEEDTOSETTHIS.php", {
        body: formData,
        method: "post",
      })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            // addMessage({
            //   message: `Request to fetch symbol list failed w/ error status ${response.status}`,
            //   classification: "error",
            // });
          }
        })
        .then((data) => {
          if (data.err) {
            // addMessage({ message: data.err, classification: "error" });
          } else {
            setSymbols(handleDataResponse(data));
          }
        })
        .catch((err) => {
          // addMessage({
          //   message: `Error requesting symbols: ${err}`,
          //   classification: "error",
          // });
        });
    }
  }, [tokenId]);

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
