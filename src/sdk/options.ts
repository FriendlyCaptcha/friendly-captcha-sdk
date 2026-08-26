/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { originOf } from "../util/url.js";

const toFRCAPIUrl = (hosts: string[]) => hosts.map((h) => `https://${h}.frcapi.com`).join(",");

const SHORTHANDS: Record<string, string> = {
  eu: toFRCAPIUrl(["eu", "eu0", "eu1"]),
  global: toFRCAPIUrl(["global", "global0", "global1"]),
};

const splitCSV = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => !!v);

const expandEndpointShorthand = (value: string) => splitCSV(SHORTHANDS[value] || value);

/**
 * resolveAPIOrigin resolves the value of the API origin to use for the SDK.
 * If no value is specified, it defaults to the "global" shorthand. The "eu" and "global" shorthands are expanded to multiple endpoints for redundancy. Custom URLs are used as-is.
 * @param optionValue The value of the API origin to use for the SDK.
 * @returns A list of API origins to use for the SDK, with shorthands expanded.
 */
export function resolveAPIOrigins(optionValue: string | undefined): string[] {
  const endpointList = optionValue || SHORTHANDS.global;
  const resolved = splitCSV(endpointList)
    .reduce((acc: string[], endpoint) => acc.concat(expandEndpointShorthand(endpoint)), [])
    .map(originOf);

  if (resolved.length > 0) {
    return resolved;
  }

  // If the endpoint string was provided but resolved to nothing (e.g. ", ,"),
  // fall back to the default global endpoint instead of returning an empty list.
  return splitCSV(SHORTHANDS.global).map(originOf);
}

/**
 * Returns the content of the `<meta name="frc-{name}">` tag, or undefined if there is no such tag.
 */
function getMetaContent(name: string): string | undefined {
  const m: HTMLMetaElement | null = document.querySelector(`meta[name="frc-${name}"]`);
  return m ? m.content : undefined;
}

export function getSDKDisableEvalPatching(): boolean {
  return !!getMetaContent("disable-eval-patching");
}

export function getSDKGuardContext(): string | undefined {
  return getMetaContent("guard-context");
}

export function getSDKAPIEndpoint(): string | undefined {
  // 1. We check for the meta tag `frc-api-endpoint`
  const m = getMetaContent("api-endpoint");
  if (m) return m;

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
