/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.test({ name: "widget completes after starting" }, async (t) => {
  t.require.numberOfWidgets(1);
  const w = t.getWidget()!;
  const completePromise = t.assert.widgetCompletes(w)
  w.start();
  
  await completePromise;

  // We destroy the widget to check the cleanup may trigger a CSP violation.
  w.destroy();
});

