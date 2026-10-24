import { describe, expect, it } from 'vitest';
import {
  calculateIncludedGST,
  calculateNetExclGST,
  formatAUD,
} from '@/lib/currency';

describe('AUD and 10% Australian GST calculations', () => {
  it('formats AUD currency properly', () => {
    expect(formatAUD(16.9)).toContain('16.90');
  });

  it('calculates 1/11th included GST accurately', () => {
    expect(calculateIncludedGST(11)).toBe(1);
    expect(calculateIncludedGST(22)).toBe(2);
    expect(calculateNetExclGST(11)).toBe(10);
  });
});
