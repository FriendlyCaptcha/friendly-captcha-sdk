/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export function stringHasPrefix(str: string, word: string) {
  // We use this because `str.startsWith` is not supported in IE11.
  return str.lastIndexOf(word, 0) === 0;
}
