/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import type { FriendlyCaptchaSDK } from "../sdk/sdk";
import { CommonCompatSDK } from "./common";
export { CompatRenderParams } from "./common";

/**
 * FriendlyCaptchaReCAPTCHACompatSDK wraps the FriendlyCaptchaSDK to provide a compatibility layer for reCAPTCHA v2.
 *
 * @public
 */
export class FriendlyCaptchaReCAPTCHACompatSDK extends CommonCompatSDK {
  constructor(sdk: FriendlyCaptchaSDK) {
    super(sdk);
  }
}
