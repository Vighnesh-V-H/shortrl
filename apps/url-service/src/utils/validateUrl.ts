/**
 * Basic URL validation utility.
 *
 * - Accepts only absolute URLs with http or https protocols.
 * - Returns `true` for valid URLs, `false` otherwise.
 *
 * Usage:
 * import { isValidUrl } from '../utils/validateUrl.js';
 * if (isValidUrl('https://example.com')) { ... }
 */

export function isValidUrl(value: unknown): boolean {
  if (!value || typeof value !== 'string') return false;

  const str = value.trim();
  if (str.length === 0) return false;

  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
