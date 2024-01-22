/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description(
  "Two widgets are created programmatically with a shorthand API endpoint ({{.Config.APIEndpoint}}), once with `sdk.attach()` and another with `sdk.createWidget`.",
);

const sitekey = "{{.Config.Sitekey}}";
const apiEndpoint = "{{.Config.APIEndpoint}}";
const mount = document.querySelector(".programmatic-mount") as HTMLElement;

const sdk = new FriendlyCaptchaSDK();
sdk.attach(); // Should mount a new widget to the div with class `frc-captcha`.

const widget2 = sdk.createWidget({ element: mount, sitekey, apiEndpoint });

sdktest.test({ name: "two widgets present" }, async (t) => {
  t.require.numberOfWidgets(2);
});

sdktest.test({ name: "widgets complete after starting" }, async (t) => {
  const widget1 = t.getWidget()!;

  t.assert.notEqual(widget1.id, widget2.id);

  const completePromise1 = t.assert.widgetCompletes(widget1);
  const completePromise2 = t.assert.widgetCompletes(widget2);
  widget1.start();
  widget2.start();

  await completePromise1;
  await completePromise2;
});
