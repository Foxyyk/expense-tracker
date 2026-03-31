/**
 * Currency Utilities
 * Handles currency formatting, symbols, and conversion
 */

export const CURRENCIES = {
  PLN: {
    symbol: "zł",
    name: "Polish Zloty",
    code: "PLN",
    position: "end", // Currency symbol position
    decimals: 2,
  },
  USD: {
    symbol: "$",
    name: "US Dollar",
    code: "USD",
    position: "start",
    decimals: 2,
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    code: "EUR",
    position: "start",
    decimals: 2,
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    code: "GBP",
    position: "start",
    decimals: 2,
  },
  UAH: {
    symbol: "₴",
    name: "Ukrainian Hryvnia",
    code: "UAH",
    position: "end",
    decimals: 2,
  },
};

/**
 * Format amount with currency
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code (e.g., 'PLN', 'USD')
 * @param {object} options - Additional options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = "PLN", options = {}) => {
  if (amount === null || amount === undefined) {
    return `0.00 ${CURRENCIES[currencyCode]?.symbol || currencyCode}`;
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES.PLN;
  const decimals = options.decimals ?? currency.decimals;

  // Format number with proper decimals
  const formatted = parseFloat(amount)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Position currency symbol based on locale
  if (currency.position === "start") {
    return `${currency.symbol}${formatted}`;
  } else {
    return `${formatted} ${currency.symbol}`;
  }
};

/**
 * Format amount as currency with space between number and symbol
 * Useful for display in UI
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrencyWithSpace = (amount, currencyCode = "PLN") => {
  if (amount === null || amount === undefined) {
    return `0.00 ${CURRENCIES[currencyCode]?.symbol || currencyCode}`;
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES.PLN;
  const formatted = parseFloat(amount).toFixed(currency.decimals);

  if (currency.position === "start") {
    return `${currency.symbol} ${formatted}`;
  } else {
    return `${formatted} ${currency.symbol}`;
  }
};

/**
 * Get currency symbol
 * @param {string} currencyCode - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = "PLN") => {
  return CURRENCIES[currencyCode]?.symbol || currencyCode;
};

/**
 * Get currency position
 * @param {string} currencyCode - Currency code
 * @returns {string} 'start' or 'end'
 */
export const getCurrencyPosition = (currencyCode = "PLN") => {
  return CURRENCIES[currencyCode]?.position || "start";
};

/**
 * Get all available currencies for select dropdown
 * @returns {array} Array of currency objects
 */
export const getCurrencyOptions = () => {
  return Object.entries(CURRENCIES).map(([code, data]) => ({
    value: code,
    label: `${code} - ${data.name} (${data.symbol})`,
    symbol: data.symbol,
  }));
};

/**
 * Parse formatted currency string back to number
 * @param {string} currencyString - Formatted currency string
 * @param {string} currencyCode - Currency code
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString, currencyCode = "PLN") => {
  if (!currencyString) return 0;

  // Remove currency symbol
  const currency = CURRENCIES[currencyCode] || CURRENCIES.PLN;
  let cleaned = currencyString.replace(currency.symbol, "").trim();

  // Remove any non-numeric characters except decimal point and minus
  cleaned = cleaned.replace(/[^\d.-]/g, "");

  return parseFloat(cleaned) || 0;
};

/**
 * Format amount as compact display (e.g., 1.2K, 1.5M)
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted string
 */
export const formatCurrencyCompact = (amount, currencyCode = "PLN") => {
  if (amount === null || amount === undefined) {
    return `0 ${CURRENCIES[currencyCode]?.symbol || currencyCode}`;
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES.PLN;
  let num = parseFloat(amount);
  let suffix = "";

  if (Math.abs(num) >= 1000000) {
    num = (num / 1000000).toFixed(1);
    suffix = "M";
  } else if (Math.abs(num) >= 1000) {
    num = (num / 1000).toFixed(1);
    suffix = "K";
  }

  const formatted = `${num}${suffix}`;

  if (currency.position === "start") {
    return `${currency.symbol}${formatted}`;
  } else {
    return `${formatted} ${currency.symbol}`;
  }
};
