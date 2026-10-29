/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * Lightweight alternative for `Object.assign` that will work in IE11.
 */
export function mergeObject(target: any, ...sources: any[]) {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    for (var key in source) {
      // `source.hasOwnProperty` may be shadowed, e.g. by a `data-has-own-property` attribute on `el.dataset`.
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}
