const apiUrl = import.meta.env.VITE_STRACKER_API_URL;

export const formatDate = (date) => {
  const monthAdjustedForJS = (date.getMonth() + 1).toString().padStart(2, "0");
  const dayPadded = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}${monthAdjustedForJS}${dayPadded}`;
};

export const apiPost = (config) => {
  const { task, symbol, startDate, endDate, limit, symbols, userId } =
    config;
  const accessToken = localStorage.getItem("access_token");
  const makeAsyncRequest = async (theFormData) => {
    let jsonPayload = {};
    let errorMessage = "";
    const apiResponse = await fetch(apiUrl, {
      body: theFormData,
      method: "POST",
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      jsonPayload = await apiResponse.json();
    } else {
      throw new Error(apiResponse.status);
    }
    // console.log(`Historical data for ${symbol} was fetched`, jsonPayload);
    if (jsonPayload.err) {
      throw new Error(jsonPayload.err);
    }
    return jsonPayload;
  };

  if (accessToken) {
    let formData = new FormData();
    formData.append("tokenId", accessToken); // api hasn't been updated yet to use access_token.
    formData.append("access_token", accessToken);
    formData.append("task", task);
    if (symbol) formData.append("symbol", symbol);
    if (symbols) formData.append("symbols", symbol);
    if (limit) formData.append("limit", limit);
    if (startDate) formData.append("startDate", formatDate(startDate));
    if (endDate) formData.append("endDate", formatDate(endDate));
    if (userId) formData.append("userId", userId);

    return makeAsyncRequest(formData);
  }
};

export default apiPost;
