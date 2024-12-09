/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

import "./zone.umd.js"

sdktest.description("Together with zone.js");

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "promises resolve" }, async (t) => {

  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve("OK");
    }, 10);
  })

  const result = await p;

  t.assert.equal(result, "OK");

  let didResolve = false;

  await Promise.resolve("abc").then((result) => {
    t.assert.equal(result, "abc");
    didResolve = true;
  });

  t.assert.truthy(didResolve);
});
