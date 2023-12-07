/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { getTrigger } from "../signals/trigger.js";
import { SentinelResponse } from "../types/sentinel.js";
import { _RootTrigger } from "../types/trigger.js";
import {
  StartMode,
  WidgetErrorData,
  _WidgetHandleOpts,
  WidgetResetOptions,
  WidgetResetTrigger,
  WidgetState,
} from "../types/widget.js";
import { mergeObject } from "../util/object.js";
import { executeOnceOnFocusInEvent, findParentFormElement, fireFRCEvent } from "./dom.js";
import { FRCEventData, FRCEventMap, FRCEventName } from "./events.js";

const DEFAULT_FORM_FIELD_NAME = "frc-captcha-response";

/**
 * This provides an API stub that provides the end-user JS API for a widget.
 *
 * This class is only instantiated by the SDK - do not create a handle yourself.
 *
 * @public
 */
export class WidgetHandle {
  /**
   * A random ID that uniquely identifies this widget in this session.
   */
  public readonly id: string;

  /**
   *  The element the widget is mounted under.
   * */
  private readonly e: HTMLElement;

  // This will be undefined if we explicitly asked for no hidden form field.
  private hiddenFormEl?: HTMLInputElement;

  /**
   * The field in the form that should be set, `null` if no form field should be set.
   * You usually don't want to change this.
   *
   * Defaults to `"frc-captcha-response"`.
   */
  private formFieldName: string | null;

  /**
   * The sitekey for this widget. It can not be changed after creation of the widget.
   * @public
   */
  public readonly sitekey?: string;

  public startMode: StartMode;

  private state: WidgetState = "init";
  private response: SentinelResponse | string = ".UNINITIALIZED";
  private focusEventPending = false;

  private _reset: (opts: WidgetResetOptions) => void;
  private _destroy: () => void;
  private _trigger: (data: { trigger: _RootTrigger }) => void;

  /**
   * @internal
   */
  public readonly ready: Promise<undefined>;

  /**
   * When this is true the widget has been destroyed and can no longer be used.
   */
  public isDestroyed = false;

  /**
   * You don't want to create this yourself, use `FriendlyCaptcha.createWidget` instead.
   * @internal
   */
  constructor(opts: _WidgetHandleOpts) {
    this.id = opts.id;
    const createOpts = opts.createOpts;
    this.e = createOpts.element;
    this.ready = opts.registered;

    if (!this.e) throw new Error("No element provided to mount widget under.");

    (this.e as any).frcWidget = this;
    this.formFieldName = createOpts.formFieldName === undefined ? DEFAULT_FORM_FIELD_NAME : createOpts.formFieldName;
    this.sitekey = createOpts.sitekey;

    this._reset = opts.callbacks.onReset;
    this._destroy = opts.callbacks.onDestroy;
    this._trigger = opts.callbacks.onTrigger;
    this.startMode = opts.createOpts.startMode || "focus";

    if (this.formFieldName !== null) {
      const iel = document.createElement("input");
      iel.type = "hidden";
      iel.style.display = "none";
      iel.name = this.formFieldName;
      this.hiddenFormEl = iel;
      // Note: we must use `appendChild` instead of `append` for IE11.
      this.e.appendChild(iel);
    }
    this.setState({ response: ".UNCONNECTED", state: "init" });

    this.ready.then(() => {
      this.handleStartMode();
    });
  }

  private handleStartMode() {
    if (this.startMode === "focus" && !this.focusEventPending && !this.isDestroyed) {
      const formElement = findParentFormElement(this.e);
      if (formElement) {
        this.focusEventPending = true;
        executeOnceOnFocusInEvent(formElement, (ev) => {
          this.trigger("focus", { ev });
          this.focusEventPending = false;
        });
      }
    } else if (this.startMode === "auto") {
      this.trigger("auto");
    }
  }

  /**
   * Reset the widget, removing any progress.
   *
   * Optional argument: an object with the name of the trigger that caused the reset.
   * You would usually keep this empty. This is the `trigger` field in the `frc:widget.reset` event, which defaults to `root`.
   */
  public reset(opts: WidgetResetOptions = { trigger: "root" }) {
    if (this.isDestroyed) throw new Error("Can not reset destroyed widget.");
    this.setState({ response: ".RESET", state: "reset", resetTrigger: opts.trigger });
    this._reset(opts);
    this.handleStartMode();
  }

  /**
   * Destroy the widget.
   *
   * This removes the `element` that the widget was mounted to as well as the hidden `frc-captcha-response` form field.
   */
  public destroy() {
    this.isDestroyed = true;
    this.hiddenFormEl?.remove();
    this.hiddenFormEl = undefined;
    this.setState({ response: ".DESTROYED", state: "destroyed" });
    this._destroy();
  }

  /**
   * @internal
   */
  private trigger(triggerType: "auto" | "focus" | "programmatic", data: { ev?: FocusEvent } = {}) {
    if (this.isDestroyed) throw new Error("Can not start destroyed widget.");
    const trigger = getTrigger(triggerType, this.startMode, this.e, data.ev);
    this._trigger({ trigger });
  }

  /**
   * Trigger the widget to start a challenge.
   * The widget will start a challenge solving in the background.
   *
   * * In `interactive` mode, the user will need to click the widget to complete the process.
   * * In `noninteractive` mode, the widget will complete the process automatically.
   *
   */
  public start() {
    this.trigger("programmatic");
  }

  /**
   * Sets the state of the widget, this is for internal use.
   * It is unlikely this is useful to call yourself.
   * @internal
   */
  public setState(s: {
    response: SentinelResponse | string;
    state: WidgetState;
    error?: WidgetErrorData;
    resetTrigger?: WidgetResetTrigger;
  }) {
    const didStateChange = this.state !== s.state;
    this.response = s.response;
    this.state = s.state;
    if (this.hiddenFormEl && this.e.isConnected !== false) {
      this.hiddenFormEl.value = s.response;
    }

    if (didStateChange) {
      this.dispatchWidgetEvent({ name: "frc:widget.statechange", error: s.error });
    }

    if (this.state === "expired") {
      this.dispatchWidgetEvent({ name: "frc:widget.expire" });
    } else if (this.state === "completed") {
      this.dispatchWidgetEvent({ name: "frc:widget.complete" });
    } else if (this.state === "error") {
      this.dispatchWidgetEvent({ name: "frc:widget.error", error: s.error });
    } else if (this.state === "reset") {
      this.dispatchWidgetEvent({ name: "frc:widget.reset", trigger: s.resetTrigger });
    }
  }

  private dispatchWidgetEvent(eventData: { name: FRCEventName } & Partial<FRCEventData>) {
    // Note on type safety: this does not check for missing fields at all
    const ed = {
      response: this.response,
      state: this.state,
      id: this.id,
    };
    mergeObject(ed, eventData);
    fireFRCEvent(this.e, ed as FRCEventData);
  }

  /**
   * Shorthand for `this.getElement().addEventListener`  (that is strictly typed in Typescript)
   */
  public addEventListener<K extends keyof FRCEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: FRCEventMap[K]) => any | { handleEvent: (ev: FRCEventMap[K]) => any },
    options?: AddEventListenerOptions,
  ) {
    this.e.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  /**
   * Shorthand for `this.getElement().removeEventListener` (that is strictly typed in Typescript)
   */
  public removeEventListener<K extends keyof FRCEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: FRCEventMap[K]) => any | { handleEvent: (ev: FRCEventMap[K]) => any },
    options?: EventListenerOptions,
  ) {
    this.e.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  /**
   * The current state of the widget.
   */
  public getState() {
    return this.state;
  }

  /**
   * The current response of the widget. This is the value that should be sent to the server and is embedded in HTML forms.
   */
  public getResponse() {
    return this.response;
  }

  /**
   * The HTML element that contains the widget.
   */
  public getElement() {
    return this.e;
  }
}
