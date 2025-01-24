/*!
 * Copyright (c) Friendly Captcha GmbH 2025.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description(
  "The site.js script is loaded before the widget tag that contains the EU API endpoint. After the widget tag is loaded, the EU agent should load and the widget should function normally.",
);

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "widget completes after focusing form" }, async (t) => {
  const w = t.getWidget()!;
  const completePromise = t.assert.widgetCompletes(w);

  const ta: HTMLTextAreaElement = document.querySelector('input[type="textarea"]')!;
  ta.focus();

  await completePromise;
});
