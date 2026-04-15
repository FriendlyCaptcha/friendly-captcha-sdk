/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description("Widget uses a CSV list of invalid API endpoints and should end in an unreachable network error.");

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "widget errors as unreachable" }, async (t) => {
  const w = t.getWidget()!;

  const errorPromise = t.assert.widgetErrors(w);
  t.startAllWidgets();

  const evtData = await errorPromise;
  t.assert.truthy(evtData.response.startsWith(".ERROR.UNREACHABLE"));
  t.assert.equal("error", evtData.state);
  t.assert.equal("network_error", evtData.error.code);
});
