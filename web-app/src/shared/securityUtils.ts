/**
 * Security & Data Sanitization Utilities
 * Protects CoinBurst application against XSS, script injection, and numeric overflow exploits.
 */

/**
 * Sanitizes input strings by stripping HTML tags, scripts, and dangerous characters.
 */
export const sanitizeText = (input: unknown, maxLength: number = 250): string => {
  if (typeof input !== 'string') return '';

  // Trim whitespace
  let clean = input.trim();

  // Strip HTML/Script tags
  clean = clean.replace(/<[^>]*>?/gm, '');

  // Strip dangerous inline JS directives
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+=/gi, '');

  // Enforce max length limit
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

/**
 * Validates monetary amounts to prevent NaN, Infinity, or negative amounts where invalid.
 */
export const validateAmount = (value: unknown, allowNegative: boolean = false): number => {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0;
    let num = value;
    if (!allowNegative && num < 0) num = Math.abs(num);
    return Math.min(Math.max(num, -1_000_000_000), 1_000_000_000);
  }

  if (typeof value === 'string') {
    let parsed = parseFloat(value);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    if (!allowNegative && parsed < 0) parsed = Math.abs(parsed);
    return Math.min(Math.max(parsed, -1_000_000_000), 1_000_000_000);
  }

  return 0;
};

/**
 * Sanitizes and normalizes category strings.
 */
export const sanitizeCategory = (category: unknown): string => {
  const sanitized = sanitizeText(category, 50);
  return sanitized || 'General';
};

/**
 * Hashes a 4-digit PIN using a fast client-side checksum algorithm.
 */
export const hashPin = (pin: string): string => {
  let hash = 0;
  const saltedPin = `coinburst_salt_${pin}`;
  for (let i = 0; i < saltedPin.length; i++) {
    const char = saltedPin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
};
