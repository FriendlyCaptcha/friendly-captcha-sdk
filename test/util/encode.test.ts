/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { encodeStringToBase64Url } from "../../src/util/encode.js";

test("encodes string to base64url correctly", (t) => {
  // Hack to ensure the global `window` object is available for the test.
  (globalThis as any).window = globalThis;

  const inputString = "Hello, World!";
  const expectedOutput = "SGVsbG8sIFdvcmxkIQ==";

  const encodedString = encodeStringToBase64Url(inputString);
  t.is(encodedString, expectedOutput);
});
