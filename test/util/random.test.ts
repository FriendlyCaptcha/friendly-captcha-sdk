/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { randomId } from "../../src/util/random.js";

test("has correct length", (t) => {
  const r0 = randomId(0);
  const r7 = randomId(7);

  t.is(r0.length, 0);
  t.is(r0, "");
  t.is(r7.length, 7);
});
