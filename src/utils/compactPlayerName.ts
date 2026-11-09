// TINH_TAM_V171_90_NAMES: compact name rendered at the worshipper's feet.
// Keep the original nickname intact in stored participant data and announcements.
export const MAX_VISIBLE_NAME_CHARS = 5; // TINH_TAM_V178_TEN_5_KY_TU

export function compactPlayerName(value: string, limit = MAX_VISIBLE_NAME_CHARS): string {
  const name = String(value || '').replace(/\s+/g, ' ').trim();
  const chars = Array.from(name);
  if (chars.length <= limit) return name;
  return chars.slice(0, Math.max(1, limit - 1)).join('') + '…';
}
