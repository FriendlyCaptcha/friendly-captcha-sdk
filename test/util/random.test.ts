/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { randomId, shuffledCopy } from "../../src/util/random.js";

test("has correct length", (t) => {
  const r0 = randomId(0);
  const r7 = randomId(7);

  t.is(r0.length, 0);
  t.is(r0, "");
  t.is(r7.length, 7);
});

test("shuffledCopy returns shuffled copy and does not mutate input", (t) => {
  const input = ["a", "b", "c"];
  const out = shuffledCopy(input);

  t.deepEqual(out.slice().sort(), input.slice().sort());
  t.deepEqual(input, ["a", "b", "c"]);
});

test("shuffledCopy reorders often and always preserves all elements", (t) => {
  const input = ["a", "b", "c", "d", "e", "f", "g"];
  const inputSignature = input.join(",");
  const expectedSorted = input.slice().sort();

  const trials = 100;
  let differentOrderCount = 0;

  for (let i = 0; i < trials; i++) {
    const out = shuffledCopy(input);

    t.deepEqual(out.slice().sort(), expectedSorted);

    if (out.join(",") !== inputSignature) {
      differentOrderCount++;
    }
  }

  t.true(differentOrderCount >= Math.floor(trials * 0.7));
});
