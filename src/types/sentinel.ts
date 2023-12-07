/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * Response values used in the hidden input field when no valid solution is present,
 * these tell you something about the state of the widget.
 *
 * @public
 */
export type SentinelResponse =
  | ".UNINITIALIZED"
  | ".UNCONNECTED"
  | ".UNSTARTED"
  | ".REQUESTING"
  | ".SOLVING"
  | ".VERIFYING"
  | ".EXPIRED"
  | ".DESTROYED"
  | ".ERROR"
  | ".RESET";
