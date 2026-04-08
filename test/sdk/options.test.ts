/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { resolveAPIOrigins } from "../../src/sdk/options.js";

test.before(() => {
  globalThis.document = { location: { origin: "https://localhost:1234" } } as any;
});

test("resolveAPIOrigin defaults to global shorthand", (t) => {
  t.is(resolveAPIOrigins(undefined), "https://global.frcapi.com");
});

test("resolveAPIOrigin expands eu shorthand", (t) => {
  t.is(
    resolveAPIOrigins("eu"),
    "https://eu.frcapi.com,https://eu0.frcapi.com,https://eu1.frcapi.com",
  );
});

test("resolveAPIOrigin expands shorthand entries in comma-separated values", (t) => {
  t.is(
    resolveAPIOrigins("https://a.example.com,eu,https://b.example.com/path"),
    "https://a.example.com,https://eu.frcapi.com,https://eu0.frcapi.com,https://eu1.frcapi.com,https://b.example.com",
  );
});

test("resolveAPIOrigin trims and ignores empty comma-separated values", (t) => {
  t.is(
    resolveAPIOrigins(" , eu , , https://example.com/foo ,,"),
    "https://eu.frcapi.com,https://eu0.frcapi.com,https://eu1.frcapi.com,https://example.com",
  );
});

test("resolveAPIOrigin resolves relative URLs to the current origin", (t) => {
  t.is(resolveAPIOrigins("/api"), "https://localhost:1234");
});