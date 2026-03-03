/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { runOnDocumentLoaded } from "../sdk/dom.js";
import { FriendlyCaptchaSDK } from "../sdk/sdk.js";

declare global {
  interface Window {
    frcaptcha: FriendlyCaptchaSDK;
  }
}

window.frcaptcha = new FriendlyCaptchaSDK();

function main() {
  window.frcaptcha.attach();
}

runOnDocumentLoaded(main);
