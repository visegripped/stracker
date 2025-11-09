/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array<number>} data - Array of prices
 * @param {number} period - EMA period
 * @returns {Array<number|null>} - Array of EMA values (null for initial values where calculation isn't possible)
 */
export const calculateEMA = (data, period) => {
  if (!data || data.length === 0 || period <= 0) {
    return [];
  }

  const ema = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    if (i < data.length) {
      sum += parseFloat(data[i]) || 0;
      ema.push(null); // Not enough data points yet
    }
  }

  if (data.length < period) {
    return ema;
  }

  // First EMA value is the SMA
  ema[period - 1] = sum / period;

  // Calculate subsequent EMA values
  for (let i = period; i < data.length; i++) {
    const price = parseFloat(data[i]) || 0;
    const prevEMA = ema[i - 1];
    ema[i] = (price - prevEMA) * multiplier + prevEMA;
  }

  return ema;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line period (default: 9)
 * @returns {Object} - Object containing macdLine, signalLine, and histogram arrays
 */
export const calculateMACD = (
  prices,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) => {
  if (!prices || prices.length === 0) {
    return {
      macdLine: [],
      signalLine: [],
      histogram: [],
    };
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine[i] = fastEMA[i] - slowEMA[i];
    } else {
      macdLine[i] = null;
    }
  }

  // Calculate signal line (EMA of MACD line)
  // First, filter out null values to calculate signal EMA
  const validMacdValues = [];
  const validMacdIndices = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      validMacdValues.push(macdLine[i]);
      validMacdIndices.push(i);
    }
  }

  const signalEMA = calculateEMA(validMacdValues, signalPeriod);
  
  // Map signal EMA back to original indices
  const signalLine = new Array(prices.length).fill(null);
  for (let i = 0; i < signalEMA.length; i++) {
    if (signalEMA[i] !== null) {
      signalLine[validMacdIndices[i]] = signalEMA[i];
    }
  }

  // Calculate histogram (MACD line - signal line)
  const histogram = [];
  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      histogram[i] = macdLine[i] - signalLine[i];
    } else {
      histogram[i] = null;
    }
  }

  return {
    macdLine,
    signalLine,
    histogram,
  };
};

/**
 * Format MACD data for display in table and graph
 * @param {Array<Object>} history - Array of historical data with date and EOD
 * @param {number} fastPeriod - Fast EMA period
 * @param {number} slowPeriod - Slow EMA period
 * @param {number} signalPeriod - Signal line period
 * @returns {Array<Object>} - Array of objects with date, EOD, MACD, Signal, and Histogram
 */
export const formatMACDData = (
  history,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) => {
  if (!history || history.length === 0) {
    return [];
  }

  // Extract EOD prices
  const prices = history.map((row) => parseFloat(row.EOD) || 0);

  // Calculate MACD
  const { macdLine, signalLine, histogram } = calculateMACD(
    prices,
    fastPeriod,
    slowPeriod,
    signalPeriod
  );

  // Format data for display
  const formattedData = history.map((row, index) => ({
    date: row.date,
    EOD: parseFloat(row.EOD) || 0,
    MACD: macdLine[index] !== null ? parseFloat(macdLine[index].toFixed(4)) : null,
    Signal: signalLine[index] !== null ? parseFloat(signalLine[index].toFixed(4)) : null,
    Histogram: histogram[index] !== null ? parseFloat(histogram[index].toFixed(4)) : null,
  }));

  return formattedData;
};

export default {
  calculateEMA,
  calculateMACD,
  formatMACDData,
};

