/** Distinct series colors for the symbol chart. Keep EOD red; M1/M2/M3/MA20 far apart. */
export const CHART_SERIES_COLORS: Record<string, string> = {
  EOD: '#dc2626',
  M1: '#2563eb',
  M2: '#16a34a',
  M3: '#7c3aed',
  MA20: '#ea580c',
  MA50: '#0d9488',
  delta: '#a16207',
  deltaMA5: '#64748b',
  deltaMA10: '#db2777',
  deltaMA20: '#0891b2',
};

export const PRIMARY_SERIES = ['EOD', 'M1', 'M2', 'M3', 'MA20'] as const;
