/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";
import type { FriendlyCaptchaReCAPTCHACompatSDK } from "../../../src/compat/recaptcha.js";

sdktest.description("In this test we test the explicit reCAPTCHA API. We create 3 widgets, and test that they behave as expected. All widgets should be in Dutch as `hl=nl` is part of the script URL.")

let onloadResolve: (value: unknown) => void;
const onloadPromise = new Promise((resolve, reject) => {
  onloadResolve = resolve;
});

(window as any).myOnloadFunction = function () {
  console.log("onload");
  onloadResolve(undefined);
};

sdktest.test({ name: "no widgets present initially" }, async (t) => {
  t.require.numberOfWidgets(0);
});

sdktest.test({ name: "window.grecaptcha is defined" }, async (t) => {
  t.assert.truthy((window as any).grecaptcha);
});

sdktest.test({ name: "onload gets called and widget behaves", timeout: 8000 }, async (t) => {
  await onloadPromise;

  const grecaptcha = (window as any).grecaptcha as FriendlyCaptchaReCAPTCHACompatSDK;
  t.require.truthy(grecaptcha);

  let didErrorCallbackGetCalled = false;


  ////////////////////////////////////////////////////////////////////////////
  // First we create 3 widgets:
  // - widget 0 has a sitekey set through the JS api
  // - widget 1 has it set through `data-sitekey`
  // - widget 2 has an invalid sitekey set. It should error when we run it.

  const w0 = grecaptcha.render("my-widget-0", { sitekey: "{{ .Config.Sitekey }}" });
  t.require.numberOfWidgets(1);
  const w1 = grecaptcha.render(document.getElementById("my-widget-1")!, { sitekey: "{{ .Config.Sitekey }}" });
  const w2 = grecaptcha.render(document.getElementById("my-widget-2")!, {
    sitekey: "some invalid sitekey",
    "error-callback": () => {
      console.log("Error callback!");
      didErrorCallbackGetCalled = true;
    },
  });
  t.require.numberOfWidgets(3);

  ////////////////////////////////////////////////////////////////////////////
  // Try the happy case, we start widget 0 and it completes.
  const widget0 = t.getWidget(w0)!;
  const initialCompletePromise = t.assert.widgetCompletes(widget0);
  grecaptcha.execute(); // Without an ID specified it should default to the first widget.

  await initialCompletePromise;
  t.assert.equal(widget0.response, grecaptcha.getResponse(w0));


  ////////////////////////////////////////////////////////////////////////////
  // Reset widget 0 and run it again, it should complete again.
  grecaptcha.reset(w0);

  const againCompletePromise = t.assert.widgetCompletes(widget0);
  grecaptcha.execute(w0); // With an ID specified this time..

  await againCompletePromise;

  ////////////////////////////////////////////////////////////////////////////
  // Widget 2 has an invalid sitekey, it should error.

  const errPromise = t.assert.widgetErrors(t.getWidget(w2)!);
  grecaptcha.execute(w2);

  await errPromise;
  t.assert.truthy(didErrorCallbackGetCalled);

  ////////////////////////////////////////////////////////////////////////////
  // Widget 1 should complete after we focus the textarea.

  const w = t.getWidget(w1)!;
  const completePromise = t.assert.widgetCompletes(w)

  const ta: HTMLTextAreaElement = document.querySelector("input[type=\"textarea\"]")!;
  ta.focus();

  await completePromise
});
