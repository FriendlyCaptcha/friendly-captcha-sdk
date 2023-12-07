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

export function getSDKAPIEndpoint(): string | undefined {
  // 1. We check for the meta tag `frc-api-endpoint`
  const m: HTMLMetaElement | null = document.querySelector(`meta[name="frc-api-endpoint"]`);
  if (m) return m.content;

  // 2. We check the current script element for `data-frc-api-endpoint`.
  const cs = document.currentScript;
  if (cs) {
    const endpoint = cs.dataset["frcApiEndpoint"];
    if (endpoint) return endpoint;
  }

  // 3. We search for widgets that specify `data-api-endpoint`.
  const we = document.querySelector(".frc-captcha[data-api-endpoint]") as HTMLElement;
  if (we) {
    const endpoint = we.dataset["apiEndpoint"];
    if (endpoint) return endpoint;
  }

  return undefined;
}

export function resolveAPIEndpoint(optionValue: string | undefined) {
  if (!optionValue) {
    // We default to the global endpoint
    return SHORTHANDS.global;
  }

  const v = SHORTHANDS[optionValue];
  if (!v) return optionValue;
  return v;
}
