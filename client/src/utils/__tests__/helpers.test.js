import {
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText,
  generateSlug,
  isValidEmail,
  isValidPhone,
  calculateDiscountPercentage,
  calculateTax,
  calculateShipping,
  getOrderStatusColor,
  getStockStatus,
  formatFileSize,
  debounce,
  storage
} from '../helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(29.99)).toBe('₹29.99');
      expect(formatCurrency(100)).toBe('₹100.00');
      expect(formatCurrency(0)).toBe('₹0.00');
    });

    it('handles different currencies', () => {
      expect(formatCurrency(29.99, 'EUR')).toBe('€29.99');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2023-12-25T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Dec 25, 2023/);
    });

    it('handles custom options', () => {
      const date = '2023-12-25T10:30:00Z';
      const formatted = formatDate(date, { month: 'long' });
      expect(formatted).toMatch(/December/);
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = '2023-12-25T10:30:00Z';
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/Dec 25, 2023/);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 20);
      expect(truncated).toBe('This is a very long...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('returns original text if shorter than limit', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('handles null/undefined text', () => {
      expect(truncateText(null)).toBeNull();
      expect(truncateText(undefined)).toBeUndefined();
    });
  });

  describe('generateSlug', () => {
    it('generates slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Product Name 123')).toBe('product-name-123');
      expect(generateSlug('Special@Characters#')).toBe('specialcharacters');
    });

    it('handles multiple spaces and dashes', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(generateSlug('--Leading-Trailing--')).toBe('leading-trailing');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates correct phone numbers', () => {
      expect(isValidPhone('+1-555-123-4567')).toBe(true);
      expect(isValidPhone('555 123 4567')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('123')).toBe(true); // Simple numbers are valid
    });
  });

  describe('calculateDiscountPercentage', () => {
    it('calculates discount percentage correctly', () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(50, 25)).toBe(50);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculateDiscountPercentage(50, 60)).toBe(0); // Sale price higher
      expect(calculateDiscountPercentage(0, 10)).toBe(0); // Original price 0
      expect(calculateDiscountPercentage(null, 10)).toBe(0); // Null input
    });
  });

  describe('calculateTax', () => {
    it('calculates tax correctly', () => {
      expect(calculateTax(100)).toBe(8); // Default 8%
      expect(calculateTax(100, 0.1)).toBe(10); // Custom 10%
    });
  });

  describe('calculateShipping', () => {
    it('calculates shipping correctly', () => {
      expect(calculateShipping(30)).toBe(9.99); // Below threshold
      expect(calculateShipping(60)).toBe(0); // Above threshold
    });

    it('handles custom thresholds', () => {
      expect(calculateShipping(30, 25, 15)).toBe(0); // Above custom threshold
      expect(calculateShipping(20, 25, 15)).toBe(15); // Below custom threshold
    });
  });

  describe('getOrderStatusColor', () => {
    it('returns correct colors for statuses', () => {
      expect(getOrderStatusColor('pending')).toBe('warning');
      expect(getOrderStatusColor('delivered')).toBe('success');
      expect(getOrderStatusColor('cancelled')).toBe('error');
      expect(getOrderStatusColor('unknown')).toBe('default');
    });
  });

  describe('getStockStatus', () => {
    it('returns correct stock status', () => {
      const product1 = {
        inventory: { trackQuantity: false }
      };
      expect(getStockStatus(product1)).toBe('unlimited');

      const product2 = {
        inventory: { trackQuantity: true, quantity: 0 }
      };
      expect(getStockStatus(product2)).toBe('out-of-stock');

      const product3 = {
        inventory: { trackQuantity: true, quantity: 5, lowStockThreshold: 10 }
      };
      expect(getStockStatus(product3)).toBe('low-stock');

      const product4 = {
        inventory: { trackQuantity: true, quantity: 50, lowStockThreshold: 10 }
      };
      expect(getStockStatus(product4)).toBe('in-stock');
    });
  });

  describe('formatFileSize', () => {
    it('formats file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('handles decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2097152)).toBe('2 MB');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('debounces function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('stores and retrieves data', () => {
      const testData = { name: 'test', value: 123 };
      storage.set('testKey', testData);
      
      const retrieved = storage.get('testKey');
      expect(retrieved).toEqual(testData);
    });

    it('returns default value for non-existent keys', () => {
      const defaultValue = 'default';
      const result = storage.get('nonExistentKey', defaultValue);
      expect(result).toBe(defaultValue);
    });

    it('removes data', () => {
      storage.set('testKey', 'testValue');
      storage.remove('testKey');
      
      const result = storage.get('testKey');
      expect(result).toBeNull();
    });

    it('clears all data', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.clear();
      
      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });

    it('handles JSON parsing errors gracefully', () => {
      // Manually set invalid JSON
      localStorage.setItem('invalidJson', 'invalid json string');
      
      const result = storage.get('invalidJson', 'default');
      expect(result).toBe('default');
    });
  });
});
