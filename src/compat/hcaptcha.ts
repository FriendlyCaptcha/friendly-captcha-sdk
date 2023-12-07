/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../sdk/sdk";
import { CommonCompatSDK } from "./common";

/**
 * Not currently used in this compatibility layer.
 * @public
 */
export type HCaptchaErrorCode =
  | "rate-limited"
  | "network-error"
  | "invalid-data"
  | "challenge-error"
  | "challenge-closed"
  | "challenge-expired"
  | "missing-captcha"
  | "invalid-captcha-id"
  | "internal-error";

/**
 * FriendlyCaptchaHCaptchaCompatSDK wraps the FriendlyCaptchaSDK to provide a compatibility layer for hCaptcha.
 *
 * @public
 */
export class FriendlyCaptchaHCaptchaCompatSDK extends CommonCompatSDK {
  constructor(sdk: FriendlyCaptchaSDK) {
    super(sdk);
  }

  /**
   * Does not do anything in Friendly Captcha, always returns an empty string for compatibility.
   * @public
   */
  public getRespKey(widgetId?: string) {
    return "";
  }
}
