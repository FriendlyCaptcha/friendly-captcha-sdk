/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

const sitekey = "{{.Config.Sitekey}}";
// Unreachable, so every widget that is still alive keeps retrying its iframe load.
const apiEndpoint = "{{.Config.APIEndpoint}}";
const mount = document.querySelector("#mount") as HTMLElement;

const retryWarnings: string[] = [];
const originalWarn = console.warn.bind(console);
console.warn = function (...args: any[]) {
  if (typeof args[0] === "string" && args[0].indexOf("Retrying widget") !== -1) {
    retryWarnings.push(args[0]);
  }
  originalWarn(...args);
};

const sdk = new FriendlyCaptchaSDK();

// React StrictMode mounts, cleans up, and mounts again, so the first widget is destroyed
// while its iframe load is still pending.
const firstWidget = sdk.createWidget({ element: mount, sitekey, apiEndpoint });
const firstWidgetId = firstWidget.id;
firstWidget.destroy();
const secondWidget = sdk.createWidget({ element: mount, sitekey, apiEndpoint });
const secondWidgetId = secondWidget.id;

const FIRST_RETRY_TIMEOUT = 3000;

sdktest.description(
  "A widget is destroyed before its iframe loads (as React StrictMode does). Only the widget that is still alive should retry.",
);

sdktest.test({ name: "only the second widget remains", sdk }, async (t) => {
  t.require.numberOfWidgets(1);
  t.assert.equal(true, firstWidget.isDestroyed);
  t.assert.equal(secondWidgetId, t.getWidget()!.id);
});

sdktest.test({ name: "destroying a widget cancels its pending iframe retries", sdk, timeout: 25_000 }, async (t) => {
  await new Promise((resolve) => setTimeout(resolve, FIRST_RETRY_TIMEOUT + 2000));

  const strayWarnings = retryWarnings.filter((w) => w.indexOf(firstWidgetId) !== -1);
  t.assert.equal(0, strayWarnings.length, `The destroyed widget logged ${strayWarnings.length} iframe retries`);

  // Without this the test would also pass when no widget retries at all.
  const liveWarnings = retryWarnings.filter((w) => w.indexOf(secondWidgetId) !== -1);
  t.assert.notEqual(0, liveWarnings.length, "The widget that is still alive should retry its iframe load");
});

sdktest.test({ name: "the destroyed widget stays destroyed", sdk }, async (t) => {
  t.assert.equal("destroyed", firstWidget.getState());
  t.assert.equal(".DESTROYED", firstWidget.getResponse());
});
