/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { WidgetErrorData, WidgetResetTrigger, WidgetState, WidgetMode } from "../types/widget";
/**
 * `"frc:widget.statechange"`
 * @public
 */
export const FRCWidgetStateChangeEventName = "frc:widget.statechange";
/**
 * `"frc:widget.complete"`
 * @public
 */
export const FRCWidgetCompleteEventName = "frc:widget.complete";
/**
 * `"frc:widget.expire"`
 * @public
 */
export const FRCWidgetExpireEventName = "frc:widget.expire";
/**
 * `"frc:widget.error"`
 * @public
 */
export const FRCWidgetErrorEventName = "frc:widget.error";
/**
 * `"frc:widget.reset"`
 * @public
 */
export const FRCWidgetResetEventName = "frc:widget.reset";

/**
 * A DOM event map for all events that can be dispatched by a widget.
 * @public
 */
export interface FRCEventMap {
  [FRCWidgetStateChangeEventName]: FRCWidgetStateChangeEvent;
  [FRCWidgetCompleteEventName]: FRCWidgetCompleteEvent;
  [FRCWidgetExpireEventName]: FRCWidgetWidgetExpireEvent;
  [FRCWidgetErrorEventName]: FRCWidgetWidgetErrorEvent;
  [FRCWidgetResetEventName]: FRCWidgetWidgetResetEvent;
}
/**
 * Names of any of the events that can be dispatched by a widget.
 * @public
 */
export type FRCEventName = keyof FRCEventMap;
/**
 * Payloads of any of the events that can be dispatched by a widget.
 * @public
 */
export type FRCEventData =
  | FRCWidgetStateChangeEventData
  | FRCWidgetCompleteEventData
  | FRCWidgetExpireEventData
  | FRCWidgetErrorEventData
  | FRCWidgetResetEventData;

/**
 * Payload of the `"frc:widget.statechange"` event.
 * @public
 */
export interface FRCWidgetStateChangeEventData {
  /**
   * `"frc:widget.statechange"`
   */
  name: typeof FRCWidgetStateChangeEventName;
  /**
   * The new state of the widget.
   */
  state: WidgetState;
  /**
   * The current `frc-captcha-response` value.
   */
  response: string;
  /**
   * The WidgetMode as returned by the API. Either "interactive" or "noninteractive".
   */
  mode?: WidgetMode;
  /**
   * The error that caused the state change, if any. Undefined if `state` is not equal to `"error"`.
   */
  error?: WidgetErrorData;
  /**
   * The widget ID that the event originated from.
   */
  id: string;
}
/**
 * Event that gets dispatched when the widget enters a new state.
 * @public
 */
export type FRCWidgetStateChangeEvent = CustomEvent<FRCWidgetStateChangeEventData>;
/**
 * Payload of the `"frc:widget.complete"` event.
 * @public
 */
export interface FRCWidgetCompleteEventData {
  /**
   * `"frc:widget.complete"`
   */
  name: typeof FRCWidgetCompleteEventName;
  state: "completed";
  /**
   * The current `frc-captcha-response` value.
   */
  response: string;
  /**
   * The widget ID that the event originated from.
   */
  id: string;
}
/**
 * Event that gets dispatched when the widget is completed. This happens when the user's browser has succesfully passed the captcha challenge.
 * @public
 */
export type FRCWidgetCompleteEvent = CustomEvent<FRCWidgetCompleteEventData>;
/**
 * Payload of the `"frc:widget.expire"` event.
 * @public
 */
export interface FRCWidgetExpireEventData {
  /**
   * `"frc:widget.expire"`
   */
  name: typeof FRCWidgetExpireEventName;
  state: "expired";
  /**
   * The current `frc-captcha-response` value.
   */
  response: string;
  /**
   * The widget ID that the event originated from.
   */
  id: string;
}
/**
 * Event that gets dispatched when the widget expires. This happens when the user takes too long to submit the captcha after it is solved.
 * @public
 */
export type FRCWidgetWidgetExpireEvent = CustomEvent<FRCWidgetExpireEventData>;
/**
 * Payload of the `"frc:widget.error"` event.
 * @public
 */
export interface FRCWidgetErrorEventData {
  /**
   * `"frc:widget.error"`
   */
  name: typeof FRCWidgetErrorEventName;
  state: "error";
  /**
   * The current `frc-captcha-response` value.
   */
  response: string;
  /**
   * The error that caused the state change.
   */
  error: WidgetErrorData;
  /**
   * The widget ID that the event originated from.
   */
  id: string;
}
/**
 * Event that gets dispatched when something goes wrong in the widget.
 * @public
 */
export type FRCWidgetWidgetErrorEvent = CustomEvent<FRCWidgetErrorEventData>;

/**
 * Payload of the `"frc:widget.reset"` event.
 * @public
 */
export interface FRCWidgetResetEventData {
  /**
   * `"frc:widget.reset"`
   */
  name: typeof FRCWidgetResetEventName;
  state: "reset";
  /**
   * The current `frc-captcha-response` value.
   */
  response: string;
  /**
   * What caused the reset. Possible values:
   * * `"widget"`: reset initiated by the widget (`"widget"`), which generally means the user clicked the reset button within the widget.
   * * `"root"`: triggered by your own code on the current page (by calling `widget.reset()`).
   * * `"agent"`: triggered by the background agent (currently never happens).
   */
  trigger: WidgetResetTrigger;
  /**
   * The widget ID that the event originated from.
   */
  id: string;
}
/**
 * Event that gets dispatched when something goes wrong in the widget.
 * @public
 */
export type FRCWidgetWidgetResetEvent = CustomEvent<FRCWidgetResetEventData>;
