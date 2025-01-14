/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const SHORTHANDS: Record<string, string> = {
  eu: "https://eu.frcapi.com/api/v2/captcha",
  global: "https://global.frcapi.com/api/v2/captcha",
};

export function resolveAPIEndpoint(optionValue: string | undefined) {
  if (!optionValue) {
    // We default to the global endpoint
    return SHORTHANDS.global;
  }

  const v = SHORTHANDS[optionValue];
  if (!v) return optionValue;
  return v;
}
