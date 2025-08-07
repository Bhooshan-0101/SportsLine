/**
 * Currency utility functions for Indian Rupees (INR)
 */

/**
 * Format a number as Indian Rupees currency
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    locale = 'en-IN',
    currency = 'INR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    });

    const result = formatter.format(amount);

    // Ensure we always use ₹ symbol regardless of browser locale support
    if (currency === 'INR' && !result.includes('₹')) {
      // Fallback: manually format with ₹ symbol
      const numberPart = new Intl.NumberFormat(locale, {
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: maximumFractionDigits,
      }).format(amount);
      return `₹${numberPart}`;
    }

    return result;
  } catch (error) {
    console.warn('Error formatting currency, using fallback:', error);
    // Fallback formatting
    const numberPart = amount.toLocaleString('en-IN', {
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    });
    return `₹${numberPart}`;
  }
};

/**
 * Format currency without the currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatAmount = (amount) => {
  return formatCurrency(amount, { showSymbol: false }).replace(/[₹,]/g, '');
};

/**
 * Format currency with Indian numbering system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with Indian numbering
 */
export const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

/**
 * Convert USD to INR (approximate conversion for display)
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - USD to INR exchange rate (default: 83)
 * @returns {number} Amount in INR
 */
export const convertUSDToINR = (usdAmount, exchangeRate = 83) => {
  if (usdAmount === null || usdAmount === undefined || isNaN(usdAmount)) {
    return 0;
  }
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Format price with discount calculation
 * @param {number} price - Current price
 * @param {number} comparePrice - Original/compare price
 * @returns {object} Object with formatted prices and discount info
 */
export const formatPriceWithDiscount = (price, comparePrice) => {
  const formattedPrice = formatCurrency(price);
  const formattedComparePrice = comparePrice ? formatCurrency(comparePrice) : null;
  
  let discount = 0;
  let discountPercentage = 0;
  
  if (comparePrice && comparePrice > price) {
    discount = comparePrice - price;
    discountPercentage = Math.round((discount / comparePrice) * 100);
  }
  
  return {
    price: formattedPrice,
    comparePrice: formattedComparePrice,
    discount: discount > 0 ? formatCurrency(discount) : null,
    discountPercentage: discountPercentage > 0 ? `${discountPercentage}%` : null,
    hasDiscount: discount > 0
  };
};

/**
 * Calculate tax amount (GST for India)
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage (default: 18% GST)
 * @returns {object} Object with tax details
 */
export const calculateTax = (amount, taxRate = 18) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return { taxAmount: 0, totalWithTax: 0, taxRate: 0 };
  }
  
  const taxAmount = (amount * taxRate) / 100;
  const totalWithTax = amount + taxAmount;
  
  return {
    taxAmount: Math.round(taxAmount),
    totalWithTax: Math.round(totalWithTax),
    taxRate: taxRate,
    formattedTaxAmount: formatCurrency(taxAmount),
    formattedTotalWithTax: formatCurrency(totalWithTax)
  };
};

/**
 * Format shipping cost
 * @param {number} shippingCost - Shipping cost amount
 * @returns {string} Formatted shipping cost or "FREE" if 0
 */
export const formatShipping = (shippingCost) => {
  if (!shippingCost || shippingCost === 0) {
    return 'FREE';
  }
  return formatCurrency(shippingCost);
};

/**
 * Calculate order total with all components
 * @param {object} orderDetails - Order details object
 * @returns {object} Complete order calculation
 */
export const calculateOrderTotal = (orderDetails) => {
  const {
    subtotal = 0,
    shipping = 0,
    discount = 0,
    taxRate = 18
  } = orderDetails;
  
  const discountedSubtotal = subtotal - discount;
  const tax = calculateTax(discountedSubtotal, taxRate);
  const total = discountedSubtotal + tax.taxAmount + shipping;
  
  return {
    subtotal: formatCurrency(subtotal),
    discount: discount > 0 ? formatCurrency(discount) : null,
    discountedSubtotal: formatCurrency(discountedSubtotal),
    tax: formatCurrency(tax.taxAmount),
    shipping: formatShipping(shipping),
    total: formatCurrency(total),
    rawTotal: total,
    taxRate: taxRate
  };
};

// Export default currency symbol
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const DEFAULT_LOCALE = 'en-IN';
