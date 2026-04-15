/*!
 * Copyright (c) Friendly Captcha GmbH 2026.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description(
  "The widget is mounted inside a shadow root. Focusing the form field above it should trigger completion in focus start mode.",
);

const sitekey = "{{.Config.Sitekey}}";
const shadowHost = document.querySelector("#shadow-host") as HTMLDivElement;
const shadowRoot = shadowHost.attachShadow({ mode: "open" });
const mount = document.createElement("div");
shadowRoot.appendChild(mount);

const sdk = new FriendlyCaptchaSDK();
const widget = sdk.createWidget({
  element: mount,
  sitekey,
  startMode: "focus",
});

sdktest.test({ name: "one widget present" }, async (t) => {
  t.require.numberOfWidgets(1);
});

sdktest.test({ name: "widget completes after focusing form" }, async (t) => {
  const completePromise = t.assert.widgetCompletes(widget);

  const ta: HTMLTextAreaElement = document.querySelector('input[type="textarea"]')!;
  ta.focus();

  await completePromise;
});
