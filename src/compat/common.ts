/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../sdk/sdk";
import { WidgetHandle } from "../sdk/widgetHandle";
import { CreateWidgetOptions } from "../types/widget";
import { parseQuery } from "../util/urlDecode";

/**
 * @internal
 */
export interface ScriptURLQueryParams {
  onload?: string;
  render?: "explicit" | "onload";
  hl?: string;
  /**
   * Only present in hcaptcha, if `"off"` then `window.grecaptcha` does not get set.
   */
  recaptchacompat?: "on" | "off";
}

/**
 * Options that can be passed to the `render` function in the ReCAPTCHA or hCaptcha compatibility mode.
 * @public
 */
export interface CompatRenderParams {
  /**
   * Required. Your public API site key.
   */
  sitekey?: string;
  theme?: "dark" | "light";
  size?: "compact" | "normal" | "invisible";
  tabindex?: number;

  callback?: string | ((response: string) => void);
  "expired-callback"?: string | (() => void);
  "chalexpired-callback"?: string | (() => void);
  "open-callback"?: string | (() => void);
  "close-callback"?: string | (() => void);
  "error-callback"?: string | (() => void);
}

/**
 * The ReCAPTCHA and hCaptcha SDKs allow you to pass either a string to a function on the window,
 * or a function itself.
 *
 * @internal
 */
function getWindowFunc(nameOrFunc: string | Function): Function | undefined {
  if (typeof nameOrFunc === "function") {
    return nameOrFunc;
  }

  const fn = (window as any)[nameOrFunc];
  if (typeof fn === "function") {
    return fn;
  }
  // This error message matches the one found in the official reCAPTCHA SDK.
  console.error("Friendly Captcha couldn't find user-provided function: " + nameOrFunc);
}

/**
 * Common shared code for compatibility layers. Most captcha providers try to have the same clientside SDK interface, so we can reuse a lot of code here.
 *
 * @internal
 */
export class CommonCompatSDK {
  sdk: FriendlyCaptchaSDK;
  public params: ScriptURLQueryParams;

  constructor(sdk: FriendlyCaptchaSDK) {
    this.sdk = sdk;
    this.params = this.getURLParams();
  }

  /**
   * @internal
   */
  private getURLParams(): ScriptURLQueryParams {
    const script = document.currentScript as HTMLScriptElement;
    if (!script) {
      // I don't think this can ever happen in an ordinary browser, but better safe than sorry.
      console.error("[FRC Compat] current script undefined.");
      return {};
    }
    if (script.src.indexOf("?") !== -1) {
      return parseQuery("?" + script.src.split("?")[1]) as unknown as ScriptURLQueryParams;
    }
    return {};
  }

  /**
   * @internal
   */
  public performOnLoad() {
    // TODO: check ordering, does attaching to `frc-captcha` elements happen first or is `onload` called first?
    // In my opinion this should be the correct order, but I haven't verified this.
    if (this.params.render !== "explicit") {
      this.sdk.attach();
    }

    const ol = this.params.onload;
    if (ol) {
      const fn = getWindowFunc(ol);
      if (fn) {
        fn();
      }
    }
  }

  /**
   * Renders a widget inside the container DOM element. Returns a unique widgetID for the widget.
   * @public
   */
  public render(
    container: HTMLElement | string,
    params: CompatRenderParams & Partial<CreateWidgetOptions> = {},
  ): string {
    let el: HTMLElement = container as HTMLElement;
    if (typeof container === "string") {
      el = document.getElementById(container)!;
    }

    if (!el) {
      throw new Error(`[FRC Compat] Could not find element ${container}`);
    }

    const widget = this.sdk.createWidget({
      ...el.dataset,
      ...params,
      element: el,
      sitekey: params?.sitekey,
      language: this.params.hl || undefined,
    });

    if (params.tabindex) {
      el.tabIndex = params.tabindex;
    }

    if (params.callback) {
      widget.addEventListener("frc:widget.complete", (ev) => {
        getWindowFunc(params.callback!)!(ev.detail.response);
      });
    }
    if (params["expired-callback"]) {
      widget.addEventListener("frc:widget.expire", (ev) => {
        getWindowFunc(params["expired-callback"]!)!();
      });
    }
    if (params["error-callback"]) {
      widget.addEventListener("frc:widget.error", (ev) => {
        getWindowFunc(params["error-callback"]!)!();
      });
    }
    if (params["open-callback"]) {
      widget.addEventListener("frc:widget.statechange", (ev) => {
        if (ev.detail.state === "requesting") {
          getWindowFunc(params["open-callback"]!)!();
        }
      });
    }
    return widget.id;
  }

  /**
   *
   * @internal
   */
  protected getWidgetOrThrow(widgetId?: string): WidgetHandle {
    if (!widgetId) {
      const widgets = this.sdk.getAllWidgets();
      if (!widgets) {
        throw new Error(`[FRC Compat] No widgets created yet.`);
      }
      return widgets[0];
    }

    const widget = this.sdk.getWidgetById(widgetId);

    // TODO: check if this actually errors in ReCAPTCHA or hCaptcha, only logs an error, or just fails silently. We should have the same behavior.
    if (!widget) {
      throw new Error(`[FRC Compat] Could not find widget ${widgetId}`);
    }
    return widget;
  }

  /**
   * Resets the hCaptcha widget with widgetID. Defaults to the first widget created if no `widgetID` is specified.
   * @public
   */
  public reset(widgetId?: string) {
    this.getWidgetOrThrow(widgetId).reset();
  }

  /**
   * Gets the response for the hCaptcha widget with widgetID. Defaults to the first widget created if no `widgetID` is specified.
   * @public
   */
  public getResponse(widgetId?: string): string {
    return this.getWidgetOrThrow(widgetId).getResponse();
  }

  /**
   * Triggers the widget programmatically. Defaults to the first widget created if no `widgetID` is specified.
   * @public
   */
  public execute(widgetId?: string, opts: { async: boolean } = { async: false }): void | Promise<string> {
    const widget = this.getWidgetOrThrow(widgetId);
    if (!opts.async) {
      widget.start();
      return;
    }

    return new Promise<string>((resolve, reject) => {
      widget.addEventListener("frc:widget.complete", (ev) => {
        resolve(ev.detail.response);
      });
      widget.addEventListener("frc:widget.error", (ev) => {
        reject(ev.detail.error);
      });
      widget.start();
    });
  }
}
