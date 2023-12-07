/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaReCAPTCHACompatSDK } from "../compat/recaptcha.js";
import { runOnDocumentLoaded } from "../sdk/dom.js";
import { FriendlyCaptchaSDK } from "../sdk/sdk.js";

declare global {
  interface Window {
    frcaptcha: FriendlyCaptchaSDK;
    grecaptcha: FriendlyCaptchaReCAPTCHACompatSDK;
  }
}

window.frcaptcha = new FriendlyCaptchaSDK();
window.grecaptcha = new FriendlyCaptchaReCAPTCHACompatSDK(window.frcaptcha);

function main() {
  window.grecaptcha.performOnLoad();
}

runOnDocumentLoaded(main);
