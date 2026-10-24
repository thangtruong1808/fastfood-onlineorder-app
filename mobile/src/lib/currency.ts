/**
 * Australian Dollar (AUD) and 10% GST Calculation Utilities
 * All menu prices in Australia are displayed GST-inclusive (10% GST).
 */

const audFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAUD(amount: number): string {
  try {
    return audFormatter.format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function calculateIncludedGST(gstInclusiveTotal: number): number {
  return Number((gstInclusiveTotal / 11).toFixed(2));
}

export function calculateNetExclGST(gstInclusiveTotal: number): number {
  const gst = calculateIncludedGST(gstInclusiveTotal);
  return Number((gstInclusiveTotal - gst).toFixed(2));
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

