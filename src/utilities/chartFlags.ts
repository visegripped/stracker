export const DEFAULT_SYMBOL_DATA_POINTS: Record<string, boolean> = {
  EOD: true,
  M1: true,
  M2: true,
  M3: true,
  MA20: true,
};

export const DEFAULT_MACD_LINES: Record<string, boolean> = {
  MACD: true,
  Signal: true,
  Histogram: false,
};

export function hasEnabledFlag(flags: Record<string, boolean>): boolean {
  return Object.values(flags).some(Boolean);
}

/** Load persisted series flags; fall back when missing, invalid, or nothing is on. */
export function readPersistedFlags(
  stored: string | null,
  defaults: Record<string, boolean>
): Record<string, boolean> {
  if (!stored) return { ...defaults };
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...defaults };
    }
    const flags = parsed as Record<string, boolean>;
    return hasEnabledFlag(flags) ? flags : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

/** Toggle a series, but never allow an empty chart. */
export function applyFlagToggle(
  current: Record<string, boolean>,
  id: string,
  value: boolean
): Record<string, boolean> {
  const updated = { ...current, [id]: value };
  return hasEnabledFlag(updated) ? updated : current;
}
