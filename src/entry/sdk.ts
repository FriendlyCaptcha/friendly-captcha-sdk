/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * A library for integrating Friendly Captcha into your website.
 * This SDK allows you to create captcha widgets, respond to their changes, and interact with them programmatically.
 *
 * @packageDocumentation
 */

export { FriendlyCaptchaSDK, FriendlyCaptchaSDKOptions } from "../sdk/sdk.js";
export type { WidgetHandle } from "../sdk/widgetHandle.js";
export type {
  WidgetState,
  CreateWidgetOptions,
  StartMode,
  APIEndpoint,
  WidgetErrorData,
  WidgetResetTrigger,
  _WidgetHandleOpts,
  WidgetResetOptions,
  _WidgetRootCallbacks,
} from "../types/widget";
export type {
  _RootTrigger,
  _AutoTrigger,
  _FocusTrigger,
  _ProgrammaticTrigger,
  _TriggerBase,
  _TriggerEventData,
  _TriggerElementData,
  _TriggerType,
} from "../types/trigger";
export type { SentinelResponse } from "../types/sentinel";
export type { WidgetErrorCode } from "../types/error.js";

export * from "../sdk/events.js";
