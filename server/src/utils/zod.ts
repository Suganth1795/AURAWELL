import { z } from 'zod';

/**
 * Parses a boolean query-string value.
 *
 * `z.coerce.boolean()` is unsafe here: it uses JavaScript truthiness, so the
 * string "false" (and "0") coerce to `true`. Only explicit truthy/falsey tokens
 * are accepted; anything else fails validation.
 */
export const booleanQuery = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');
