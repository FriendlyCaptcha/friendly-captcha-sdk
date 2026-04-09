/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { getRetryOrigins, getRetryOriginIndex, getRetrySrc } from "../../src/sdk/retry.js";

test.before(() => {
  globalThis.document = { location: { origin: "https://localhost:1234" } } as any;
});

test("getRetryOrigins keeps primary first and shuffles fallbacks", (t) => {
  const origins = [
    "https://primary.example.com",
    "https://fallback-a.example.com",
    "https://fallback-b.example.com",
    "https://fallback-c.example.com",
  ];
  const out = getRetryOrigins(origins);

  t.is(out[0], "https://primary.example.com");
  t.deepEqual(out.slice().sort(), origins.slice().sort());
});

test("getRetryOriginIndex uses primary for first two attempts", (t) => {
  const retryOrigins = getRetryOrigins(["https://primary.example.com", "https://fallback.example.com"]);

  t.is(getRetryOriginIndex(0, retryOrigins), 0);
  t.is(getRetryOriginIndex(1, retryOrigins), 0);
  t.is(getRetryOriginIndex(2, retryOrigins), 0);
});

test("getRetryOriginIndex uses fallback order and random fallback after exhaustion", (t) => {
  const retryOrigins = getRetryOrigins([
    "https://primary.example.com",
    "https://fallback-a.example.com",
    "https://fallback-b.example.com",
  ]);

  t.is(getRetryOriginIndex(3, retryOrigins), 1);
  t.is(getRetryOriginIndex(4, retryOrigins), 2);

  let sawFallback1 = false;
  let sawFallback2 = false;
  for (let i = 0; i < 50; i++) {
    const idx = getRetryOriginIndex(5, retryOrigins);
    t.truthy(idx === 1 || idx === 2);
    if (idx === 1) sawFallback1 = true;
    if (idx === 2) sawFallback2 = true;
  }
  t.truthy(sawFallback1);
  t.truthy(sawFallback2);
});

test("getRetryOriginIndex always returns primary when no fallback origins exist", (t) => {
  const retryOrigins = getRetryOrigins(["https://primary.example.com"]);

  t.is(getRetryOriginIndex(1, retryOrigins), 0);
  t.is(getRetryOriginIndex(2, retryOrigins), 0);
  t.is(getRetryOriginIndex(3, retryOrigins), 0);
  t.is(getRetryOriginIndex(4, retryOrigins), 0);
});

test("getRetrySrc supports relative src and normalizes next origin", (t) => {
  const out = getRetrySrc(
    "/api/v2/captcha/widget?foo=1",
    "https://fallback.example.com/some/path/",
    2,
  );

  t.is(out, "https://fallback.example.com/api/v2/captcha/widget?foo=1&retry=2");
});

test("getRetrySrc appends retry for absolute src", (t) => {
  const out = getRetrySrc(
    "https://primary.example.com/api/v2/captcha/widget?foo=1",
    "https://fallback.example.com/",
    3,
  );

  t.is(out, "https://fallback.example.com/api/v2/captcha/widget?foo=1&retry=3");
});
