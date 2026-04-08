/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { shuffledCopy } from "../util/random.js";

/**
 * Build a retry origin list with these rules:
 * 1) The first entry is the primary origin (origins[0]).
 * 2) Remaining entries are fallback origins (origins[1..]) in shuffled order.
 *
 * Example:
 * origins = ["https://0.example.com", "https://1.example.com", "https://2.example.com", "https://3.example.com"]
 * shuffled fallbacks (example) = ["https://2.example.com", "https://3.example.com", "https://1.example.com"]
 * output origins = [
 *   "https://0.example.com",
 *   "https://2.example.com",
 *   "https://3.example.com",
 *   "https://1.example.com"
 * ]
 * 
 * @private
 */
export function getRetryOrigins(origins: string[]): string[] {
  if (origins.length === 0) return [];
  return [origins[0]].concat(shuffledCopy(origins.slice(1)));
}

/**
 * Returns the index in retryOrigins to use for a given attempt number.
 *
 * - Attempt 1 and 2 always map to index 0 (primary).
 * - Following attempts map to fallback indices in order.
 * - If attempts exceed unique fallbacks, a random fallback index is used.
 * 
 * @private
 */
export function getRetryOriginIndex(
  attemptNumber: number,
  retryOrigins: string[],
): number {
  const retryOriginsLength = retryOrigins.length;
  if (retryOriginsLength === 0) return -1;
  // We intentionally map attempt 0 to primary as a bug-tolerant fallback.
  if (attemptNumber <= 2 || retryOriginsLength === 1) return 0;

  const fallbackCount = retryOriginsLength - 1;
  const fallbackAttempt = attemptNumber - 2;
  if (fallbackAttempt <= fallbackCount) {
    return fallbackAttempt;
  }

  return 1 + Math.floor(Math.random() * fallbackCount);
}
