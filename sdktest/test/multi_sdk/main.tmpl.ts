/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description("Two SDKs are created. A warning should show, but it should be fully functional still.");

const sitekey = "{{.Config.Sitekey}}";
const mount1 = document.querySelector("#mount1") as HTMLElement;
const mount2 = document.querySelector("#mount2") as HTMLElement;
const mount3 = document.querySelector("#mount3") as HTMLElement;

const sdk1 = new FriendlyCaptchaSDK();
sdk1.attach() // Should mount a new widget to the div with class `frc-captcha`. 

const widget2 = sdk1.createWidget({element: mount1, sitekey});


sdktest.test({ name: "Two widgets present" }, async (t) => {
  t.require.numberOfWidgets(2);
});

sdktest.test({ name: "Creating a second SDK isn't problematic" }, async (t) => {
  const widget1 = t.getWidget()!;

  const sdk2 = new FriendlyCaptchaSDK();
  sdk2.attach() // Should NOT mount a new widget as SDK1 already attached to it.
  t.assert.equal(sdk1.getAllWidgets().length, 2);
  t.assert.equal(sdk2.getAllWidgets().length, 0);

  const widget3 = sdk2.createWidget({element: mount2, sitekey});
  // The SDKs only know about their own widgets.
  t.assert.equal(sdk1.getAllWidgets().length, 2);
  t.assert.equal(sdk2.getAllWidgets().length, 1);
  
  const completePromise1 = t.assert.widgetCompletes(widget1)
  const completePromise2 = t.assert.widgetCompletes(widget2)
  const completePromise3 = t.assert.widgetCompletes(widget3)
  widget1.start();
  widget2.start();
  widget3.start();

  await completePromise1;
  await completePromise2;
  await completePromise3;

  widget1.destroy();
  t.assert.equal(sdk1.getAllWidgets().length, 1);


});

