import type { TempleCharacterType } from '../types/temple';

/**
 * Select a 3D character only if a viewer intentionally puts a role at the
 * beginning of their comment. Never remove or rewrite the real comment.
 *
 * `Nam mô A Di Đà Phật` is a common prayer, NOT a request for the Nam skin.
 */
export function detectTempleCharacterType(comment: string): TempleCharacterType | null {
  if (typeof comment !== 'string') return null;
  const start = comment
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi');

  if (/^nam[\s_-]+mo(?:\b|$)/.test(start)) return null;

  // Avoid prefix matching: 'nữ' matches, but 'nữa' does not.
  // Hyphens, colons and punctuation after the role are allowed.
  const match = /^(cao[\s_-]+tang|nam|nu|ong|ba|ni|tieu)(?=$|[\s:;,!.?\-–—])/u.exec(start);
  if (!match) return null;

  switch (match[1].replace(/[\s_-]+/g, ' ')) {
    case 'cao tang': return 'cao_tang';
    case 'nam': return 'nam';
    case 'nu': return 'nu';
    case 'ong': return 'ong';
    case 'ba': return 'ba';
    case 'ni': return 'ni';
    case 'tieu': return 'tieu';
    default: return null;
  }
}
