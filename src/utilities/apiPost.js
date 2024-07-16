export const formatDate = (date) => {
  const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, "0");
  const dayPadded = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
};

export const apiPost = (config) => {
  // refactor this so that tokenId is grabbed out of the session. That'll be lighter than every requesting component requiring authContext.
  const { tokenId, task, symbol, startDate, endDate, limit, symbols } = config;

  const makeAsyncRequest = async (theFormData) => {
    let jsonPayload = {};
    const apiResponse = await fetch(
      "https://visegripped.com/stracker/api.php",
      {
        body: theFormData,
        method: "post",
      }
    );

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      jsonPayload = await apiResponse.json();
    } else {
      throw new Error(response.status);
    }
    // console.log(`Historical data for ${symbol} was fetched`, jsonPayload);
    if (jsonPayload.err) {
      throw new Error(jsonPayload.err);
    }
    return jsonPayload;
  };

  if (tokenId) {
    let formData = new FormData();
    formData.append("tokenId", tokenId);
    formData.append("task", task);
    if (symbol) formData.append("symbol", symbol);
    if (symbols) formData.append("symbols", symbol);
    if (limit) formData.append("limit", limit);
    if (startDate) formData.append("startDate", formatDate(startDate));
    if (endDate) formData.append("endDate", formatDate(endDate));

    return makeAsyncRequest(formData);
  }
};

export default apiPost;
