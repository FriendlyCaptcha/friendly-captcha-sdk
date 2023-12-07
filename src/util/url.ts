/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { stringHasPrefix } from "./string.js";

const originRegex = /^((?:\w+:)?\/\/([^\/]+))/;

export function encodeQuery(queryParams: Record<string, string>) {
  // We rewrite the next few lines to not use Object.entries, which is not supported in IE11.
  // return Object.entries(queryParams)
  //   .map((kv) => kv.map(encodeURIComponent).join("="))
  //   .join("&");

  let out: string[] = [];
  const k = Object.keys(queryParams);
  const eu = encodeURIComponent;
  for (let i = 0; i < k.length; i++) {
    out.push(`${eu(k[i])}=${eu(queryParams[k[i]])}`);
  }
  return out.join("&");
}

export function originOf(url: string) {
  const l = document.location;
  // Relative URL
  if (stringHasPrefix(url, "/") || stringHasPrefix(url, ".")) {
    if (l.origin) return l.origin;
    return l.protocol + "//" + l.host; // For old browsers that don't have `document.location.origin`
  }

  // We use this instead of the browser built-in URL because it's not supported in IE11 (and similar ancient browsers).
  // The polyfill for it is 6KB, so we use a regex instead.
  const match = url.match(originRegex);
  if (!match) throw new Error("Invalid URL: " + url);

  return match[1];
}
