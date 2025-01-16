/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "none widget is not triggered by focus" }, async (t) => {
  const w = t.getWidget()!;

  const ta: HTMLTextAreaElement = document.querySelector('input[type="textarea"]')!;
  ta.focus();

  if (w.getState() === "unactivated") {
    // Already unactivated (init done)
  } else {
    await t.assert.widgetInits(w);
  }
});
