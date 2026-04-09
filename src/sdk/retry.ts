/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { shuffledCopy } from "../util/random.js";
import { originOf } from "../util/url.js";
import { stringHasPrefix } from "../util/string.js";

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
 * - Attempts 0, 1, and 2 map to index 0 (primary).
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

/**
 * Builds a retry URL by replacing the source origin with `nextOrigin` and
 * appending a `retry=<n>` query parameter.
 *
 * - Supports absolute and relative `src` values.
 * - Normalizes `nextOrigin` to its origin (ignoring trailing slashes/paths).
 * - Assumes `src` does not contain a URL fragment (`#...`).
 *
 * @private
 */
export function getRetrySrc(src: string, nextOrigin: string, retryCount: number): string {
  const srcOrigin = originOf(src);
  const normalizedNextOrigin = originOf(nextOrigin);

  let pathAndQuery = stringHasPrefix(src, srcOrigin) ? src.slice(srcOrigin.length) : src;
  if (pathAndQuery.length === 0) {
    pathAndQuery = "/";
  } else if (!stringHasPrefix(pathAndQuery, "/")) {
    pathAndQuery = "/" + pathAndQuery;
  }

  const separator = pathAndQuery.indexOf("?") === -1 ? "?" : "&";
  return normalizedNextOrigin + pathAndQuery + separator + "retry=" + retryCount;
}
