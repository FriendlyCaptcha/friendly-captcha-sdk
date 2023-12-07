/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Note: we put this in its own file as we only import it from the reCAPTCHA and hCaptcha compat files.
// This way we can be sure that it won't be part of the bundle in case tree-shaking isn't smart enough.

/**
 * By using this instead of the browser built-in URLSearchParams we can save shipping a 11kb polyfill in the polyfilled version.
 * @param queryString (starting with a `"?"`)
 * @returns an object like `{a: "3", b: "bla"}`
 *
 * @internal
 */
export function parseQuery(queryString: string): Record<string, string> {
  const out: Record<string, string> = {};
  queryString
    .replace(/^\?/, "")
    .split("&")
    .forEach((kv) => {
      if (kv.length === 0) return;
      const [k, v] = kv.split("=");
      out[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  return out;
}
