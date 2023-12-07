/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import {
  FRCWidgetCompleteEventData,
  FRCWidgetErrorEventData,
  FRCWidgetExpireEventData,
  FRCWidgetStateChangeEvent,
  FRCWidgetStateChangeEventData,
  FriendlyCaptchaSDK,
  WidgetHandle,
  WidgetState,
} from "../../dist/sdk";
import { SDKTestFramework } from "./framework";
import type { TestOpts } from "./types";
import { AssertionError, SkipError } from "./error";

export class AssertLib {
  private sdk;
  private continueOnError: boolean;

  private onerror: (err: AssertionError) => void = () => undefined;

  constructor(sdk: FriendlyCaptchaSDK, continueOnError: boolean, onError: (err: AssertionError) => void) {
    this.sdk = sdk;
    this.continueOnError = continueOnError;
    this.onerror = onError;
  }

  private err(error: AssertionError) {
    this.onerror(error);
    if (this.continueOnError) {
      console.error(error);
    } else {
      throw error;
    }
    return false;
  }

  truthy(value: any, message?: string) {
    if (!value) {
      return this.err(new AssertionError("truthy", value, message));
    }
    return true;
  }

  falsy(value: any, message?: string) {
    if (value) {
      return this.err(new AssertionError("falsy", value, message));
    }
    return true;
  }

  /**
   * Compare using `===`
   */
  equal<A>(expected: A, actual: A, message?: string) {
    if (expected !== actual) {
      return this.err(new AssertionError(expected, actual, message));
    }
    return true;
  }

  /**
   * Compare using `!==`
   */
  notEqual<A>(expected: A, actual: A, message?: string) {
    if (expected === actual) {
      return this.err(new AssertionError(expected, actual, message || `Not Equal: ${expected} ${actual}.`));
    }
    return true;
  }

  numberOfWidgets(num: number) {
    const numWidgets = this.sdk.getAllWidgets().length;
    return this.equal(num, numWidgets, `Expected ${num} widgets, but found ${numWidgets} widgets.`);
  }

  async widgetErrors(widget: WidgetHandle) {
    return new Promise<FRCWidgetErrorEventData>((resolve) => {
      widget.addEventListener("frc:widget.error", (ev) => {
        resolve(ev.detail);
      });
    });
  }

  async widgetCompletes(widget: WidgetHandle) {
    return new Promise<FRCWidgetCompleteEventData>((resolve) => {
      widget.addEventListener("frc:widget.complete", (ev) => {
        resolve(ev.detail);
      });
    });
  }

  async widgetExpires(widget: WidgetHandle) {
    return new Promise<FRCWidgetExpireEventData>((resolve) => {
      widget.addEventListener("frc:widget.expire", (ev) => {
        resolve(ev.detail);
      });
    });
  }

  /**
   * Widget enters given state without first going into any other state.
   * @param widget
   * @param state
   * @returns
   */
  async widgetEntersStateNext(widget: WidgetHandle, state: WidgetState) {
    return this.widgetEntersStates(widget, [state]);
  }

  /**
   * Widget enters states in order.
   * @param widget
   * @param states
   * @returns
   */
  async widgetEntersStates(widget: WidgetHandle, states: WidgetState[], message?: string) {
    return new Promise<FRCWidgetStateChangeEventData[]>((resolve, reject) => {
      let eventDatas: FRCWidgetStateChangeEventData[] = [];
      let i = 0;

      const listener = (ev: FRCWidgetStateChangeEvent) => {
        eventDatas.push(ev.detail);
        const newState = ev.detail.state;
        const expectedState = states[eventDatas.length - 1];
        if (ev.detail.state !== expectedState) {
          widget.removeEventListener("frc:widget.statechange", listener);
          this.err(
            new AssertionError(
              expectedState,
              newState,
              message || `Wrong state at idx ${i}:\nExpected state ${expectedState}\nActual state ${newState}.`
            )
          );
          resolve(eventDatas);
        }
        i++;
        if (i >= states.length) {
          widget.removeEventListener("frc:widget.statechange", listener);
          resolve(eventDatas);
        }
      };
      widget.addEventListener("frc:widget.statechange", listener);
    });
  }
}

/**
 * Object containing assertions and shortcuts, passed as the only argument into tests.
 */
export class SDKTestObject {
  private f: SDKTestFramework;

  public sdk: FriendlyCaptchaSDK;
  public opts: TestOpts;

  /**
   * Assertions that if they fail, will still continue the rest of the test.
   */
  public assert: AssertLib;

  /**
   * Assertions that must be met - if assertions fail the test aborts.
   */
  public require: AssertLib;

  public errors: Error[] = [];

  constructor(framework: SDKTestFramework, opts: TestOpts) {
    this.f = framework;
    this.opts = opts;
    if (opts.sdk) {
      this.sdk = opts.sdk;
    } else if (window.window.frcaptcha) {
      this.sdk = window.frcaptcha;
    } else {
      const agentIframe = document.querySelector("iframe.frc-i-agent");
      if (agentIframe) {
        this.sdk = (agentIframe as any).frcSDK;
      } else {
        console.warn("sdktest: SDK not found");
      }
    }

    this.assert = new AssertLib(this.sdk, true, (err) => this.errors.push(err));
    this.require = new AssertLib(this.sdk, false, (err) => this.errors.push(err));
  }

  /**
   * Skip the rest of this test, exits the function early.
   */
  skip() {
    console.warn(`Skipping test ${this.opts}`, this.opts);
    throw new SkipError();
  }

  startAllWidgets() {
    const widgets = this.sdk.getAllWidgets();
    for (let i = 0; i < widgets.length; i++) {
      widgets[i].start();
    }
  }

  /**
   * Gets the first widget, or a widget with a specific ID or at a specific index.
   */
  getWidget(idOrIndex?: string | number) {
    if (idOrIndex === undefined) {
      return this.sdk.getAllWidgets()[0];
    } else if (typeof idOrIndex === "number") {
      return this.sdk.getAllWidgets()[idOrIndex];
    } else {
      return this.sdk.getWidgetById(idOrIndex);
    }
  }

  async waitUntilWidgetEntersState(widget: WidgetHandle, state: WidgetState) {
    return new Promise<FRCWidgetStateChangeEventData>((resolve) => {
      const listener = (ev) => {
        if (ev.detail.state === state) {
          widget.removeEventListener("frc:widget.statechange", listener);
          resolve(ev.detail);
        }
      };
      widget.addEventListener("frc:widget.statechange", listener);
    });
  }

  async waitUntilWidgetCompletes(widget: WidgetHandle, state: WidgetState) {
    return new Promise<FRCWidgetCompleteEventData>((resolve) => {
      const listener = (ev) => {
        if (ev.detail.state === state) {
          widget.removeEventListener("frc:widget.complete", listener);
          resolve(ev.detail);
        }
      };
      widget.addEventListener("frc:widget.complete", listener);
    });
  }
}
