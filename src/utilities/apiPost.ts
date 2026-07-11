export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}${month}${day}`;
};

interface ApiConfig {
  task: string;
  symbol?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  userId?: string;
  alertTypes?: string[];
}

/** POST to /api. Throws on token absence; rejects on API error. */
export const apiPost = (config: ApiConfig): Promise<unknown> => {
  const { task, symbol, startDate, endDate, limit, userId, alertTypes } = config;
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return Promise.reject(new Error('No access token available. Please sign in.'));
  }

  const formData = new FormData();
  formData.append('access_token', accessToken);
  formData.append('tokenId', accessToken);
  formData.append('task', task);
  if (symbol) formData.append('symbol', symbol);
  if (limit != null) formData.append('limit', String(limit));
  if (startDate) formData.append('startDate', formatDate(startDate));
  if (endDate) formData.append('endDate', formatDate(endDate));
  if (userId) formData.append('userId', userId);
  if (alertTypes) {
    alertTypes.forEach((t) => formData.append('alertTypes[]', t));
  }

  return fetch('/api', { method: 'POST', body: formData }).then(async (res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (json && typeof json === 'object' && 'err' in json) {
      throw new Error(String((json as { err: string }).err));
    }
    return json;
  });
};

export default apiPost;
