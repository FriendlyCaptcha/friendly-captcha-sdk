/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Encodes a string to Base64 URL format. If TextEncoder is not available, returns an empty string.
 * @param str {string} The string to encode.
 * @return {string} The Base64 URL encoded string, or an empty string if TextEncoder is not available.
 * 
 * @private
 */
export function encodeStringToBase64Url(str: string): string {
  if (!window.TextEncoder) {
    return ""
  }
  return encodeBase64Url(new TextEncoder().encode(str));
}

/**
 * Encodes a Uint8Array to Base64 URL format.
 * @param bytes {Uint8Array} The byte array to encode.
 * @returns {string} The Base64 URL encoded string.
 * 
 * @private
 */
export function encodeBase64Url(bytes: Uint8Array): string {
  const len = bytes.length;
  let base64 = "";

  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i + 0];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    // This temporary variable stops the NextJS 13 compiler from breaking this code in optimization.
    // See issue https://github.com/FriendlyCaptcha/friendly-challenge/issues/165
    let t = "";
    t += CHARS.charAt(b0 >>> 2);
    t += CHARS.charAt(((b0 & 3) << 4) | (b1 >>> 4));
    t += CHARS.charAt(((b1 & 15) << 2) | (b2 >>> 6));
    t += CHARS.charAt(b2 & 63);
    base64 += t;
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
}
