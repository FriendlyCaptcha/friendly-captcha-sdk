/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { encodeQuery, originOf } from "../../src/util/url.js";

test("encodes query", (t) => {
  const q = { a: "3", b: "ab", c: "" };
  const enc = encodeQuery(q);

  t.deepEqual(enc, "a=3&b=ab&c=");
});

test("calculates origin", (t) => {
  // There is no `document` in nodejs, so we need to mock it.
  globalThis.document = { location: { origin: "https://localhost:1234" } } as any;

  t.deepEqual(originOf("https://example.com"), "https://example.com");
  t.deepEqual(originOf("https://a.b.c.example.com/a/b/c"), "https://a.b.c.example.com");
  t.deepEqual(originOf("/"), "https://localhost:1234");
  t.deepEqual(originOf("/asdf"), "https://localhost:1234");
  t.deepEqual(originOf("./foo"), "https://localhost:1234");
  t.deepEqual(originOf("http://localhost:123"), "http://localhost:123");
  t.deepEqual(originOf("http://127.0.0.1:543/a/b/c?origin=http://localhost:123"), "http://127.0.0.1:543");
});
