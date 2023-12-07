/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { StartMode } from "./widget";

/**
 * A way the widget can be triggered.
 * @internal
 */
export type _TriggerType = "auto" | "focus" | "programmatic" | "widget";

/**
 * @internal
 * Data that describes the event that triggered the widget.
 */
export type _RootTrigger = _FocusTrigger | _ProgrammaticTrigger | _AutoTrigger;

/**
 * @internal
 * Common fields for all trigger types.
 */
export interface _TriggerBase {
  /** Compatibility version, always 1 for now. */
  v: 1;
  /** The time the widget was triggered. */
  pnow: number;
  /** What triggered the widget. */
  tt: _TriggerType;
  /** The start mode of the widget. */
  sm: StartMode | "";
  /** Information about the element that the trigger happened to. */
  el: _TriggerElementData;
  /** error stack */
  stack: string;

  /** `window.event` is truthy */
  we: boolean;
  /** `window.event.isTrusted` is truthy */
  weit: boolean;
}

/**
 * @internal
 * Tells us something about the widget within the page.
 */
export interface _TriggerElementData {
  /** `element.getBoundingClientRect()` */
  bcr: [number, number, number, number];
  /** `document.body.contains` */
  con: boolean;
}

/**
 * @internal
 */
export interface _TriggerEventData {
  /** `event.timeStamp` */
  ts: number;
  /** `event.relatedTarget` is truthy */
  rt: boolean;
  /** `event.explicitOriginalTarget` is truthy */
  eot: boolean;
  /** `event.isTrusted` */
  it: boolean;
}

/**
 * @internal
 * The widget triggered automatically because of the `startMode` setting `"auto"`.
 */
export interface _AutoTrigger extends _TriggerBase {
  /** Always `"auto"` for `AutoTrigger` */
  tt: "auto";
}

/**
 * @internal
 * The widget triggered because of a user interaction on the form.
 */
export interface _FocusTrigger extends _TriggerBase {
  /** Always `"focus"` for `FocusTrigger` */
  tt: "focus";
  ev: _TriggerEventData;
}

/**
 * @internal
 * The widget was triggered programmatically.
 **/
export interface _ProgrammaticTrigger extends _TriggerBase {
  /** Always `"programmatic"` for `ProgrammaticTrigger` */
  tt: "programmatic";
}
