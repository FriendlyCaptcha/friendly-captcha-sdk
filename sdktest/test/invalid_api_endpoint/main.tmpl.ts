/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description("The API endpoint is invalid (set to {{ .Config.APIEndpoint }}), which should error.");

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "errors after starting" }, async (t) => {
  const w = t.getWidget()!;

  const errorPromise = t.assert.widgetErrors(w);
  t.startAllWidgets();

  const evtData = await errorPromise;
  t.assert.equal(".ERROR", evtData.response);
  t.assert.equal("error", evtData.state);
  t.assert.equal("network_error", evtData.error.code);
});
