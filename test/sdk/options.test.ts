/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { resolveAPIOrigins, getSDKAPIEndpoint } from "../../src/sdk/options.js";

test.before(() => {
  globalThis.document = { location: { origin: "https://localhost:1234" } } as any;
});

test("resolveAPIOrigin defaults to global shorthand", (t) => {
  t.deepEqual(resolveAPIOrigins(undefined), ["https://global.frcapi.com"]);
});

test("resolveAPIOrigin expands eu shorthand", (t) => {
  t.deepEqual(
    resolveAPIOrigins("eu"),
    ["https://eu.frcapi.com", "https://eu0.frcapi.com", "https://eu1.frcapi.com"],
  );
});

test("resolveAPIOrigin expands shorthand entries in comma-separated values", (t) => {
  t.deepEqual(
    resolveAPIOrigins("https://a.example.com,eu,https://b.example.com/path"),
    [
      "https://a.example.com",
      "https://eu.frcapi.com",
      "https://eu0.frcapi.com",
      "https://eu1.frcapi.com",
      "https://b.example.com",
    ],
  );
});

test("resolveAPIOrigin trims and ignores empty comma-separated values", (t) => {
  t.deepEqual(
    resolveAPIOrigins(" , eu , , https://example.com/foo ,,"),
    ["https://eu.frcapi.com", "https://eu0.frcapi.com", "https://eu1.frcapi.com", "https://example.com"],
  );
});

test("resolveAPIOrigin resolves relative URLs to the current origin", (t) => {
  t.deepEqual(resolveAPIOrigins("/api"), ["https://localhost:1234"]);
});

test("resolveAPIOrigin falls back to global shorthand when endpoint list is empty", (t) => {
  t.deepEqual(resolveAPIOrigins(" , , "), ["https://global.frcapi.com"]);
});

test("data-api-endpoint CSV from widget attribute is split correctly", (t) => {
  const widgetEl = {
    dataset: {
      apiEndpoint: "https://a.example.com,https://b.example.com",
    },
  } as any;

  globalThis.document = {
    location: { origin: "https://localhost:1234" },
    currentScript: null,
    querySelector: (selector: string) => {
      if (selector === 'meta[name="frc-api-endpoint"]') return null;
      if (selector === ".frc-captcha[data-api-endpoint]") return widgetEl;
      return null;
    },
  } as any;

  const endpoint = getSDKAPIEndpoint();
  t.deepEqual(resolveAPIOrigins(endpoint), ["https://a.example.com", "https://b.example.com"]);
});