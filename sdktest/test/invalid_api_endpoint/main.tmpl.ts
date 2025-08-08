/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

const mySubmitButton = document.querySelector("input[type=submit]") as HTMLButtonElement;
mySubmitButton.disabled = true;

const el = document.querySelector(".frc-captcha.hide-on-error-unreachable")!;
el.addEventListener("frc:widget.error", function (event) {
  //@ts-ignore
  console.error("Friendly Captcha widget ran into an error, event:", event.detail);

  //@ts-ignore
  if (event.detail.error.code === "network_error" && event.detail.response.indexOf(".ERROR.UNREACHABLE") !== -1) {
    //@ts-ignore
    el.style.display = "none";
  }

  mySubmitButton.disabled = false;
});

sdktest.description("The API endpoint is invalid (set to {{ .Config.APIEndpoint }}), which should error.");

sdktest.test({ name: "two widgets present" }, async (t) => {
  t.require.numberOfWidgets(2);
});

sdktest.test({ name: "errors after starting" }, async (t) => {
  const w = t.getWidget()!;

  const errorPromise = t.assert.widgetErrors(w);
  t.startAllWidgets();

  const evtData = await errorPromise;
  t.assert.truthy(evtData.response.startsWith(".ERROR.UNREACHABLE"));
  t.assert.equal("error", evtData.state);
  t.assert.equal("network_error", evtData.error.code);
});

sdktest.test({ name: "second widget is hidden on error" }, async (t) => {
  const w = t.getWidget(1)!;

  await t.assert.widgetErrors(w);

  t.assert.equal("none", w.getElement().style.display, "The second widget should be hidden on error");
  // Button should be enabled again
  t.assert.equal(false, mySubmitButton.disabled, "The submit button should be enabled again after the error");
});
