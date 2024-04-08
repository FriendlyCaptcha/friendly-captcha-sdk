/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { WidgetErrorCode } from "./error";
import { SentinelResponse } from "./sentinel";
import { _RootTrigger } from "./trigger";

/**
 * The state the widget is in. See the [widget lifecycle](../lifecycle) docs for more information.
 * @public
 */
export type WidgetState =
  | "init"
  | "reset"
  | "unactivated"
  | "activating"
  | "activated"
  | "requesting"
  | "solving"
  | "verifying"
  | "completed"
  | "expired"
  | "error"
  | "destroyed";

/**
 * The start mode of the widget.
 *
 * * `"auto"`: the widget gets activated as soon as it is created.
 * * `"focus"`: the widget gets activated as soon as the form above it is focused.
 * * `"none"`: The widget does not get activated automatically at all, the user needs to press the widget (or `.start()` gets called using the Javascript API).
 *
 * @public
 */
export type StartMode = "focus" | "auto" | "none";

/**
 * The mode of the widget.
 * * `"interactive"` (default): the widget is interactive: the user needs to click the checkbox to finalize the captcha.
 *   This mode offers the best anti-bot protection.
 * * `"noninteractive"`: the widget is non-interactive: the captcha is solved without any user interaction required.
 */
export type WidgetMode = "interactive" | "noninteractive";

/**
 * What caused the widget to reset.
 * * `root`: Code on the root page (= your website code or plugin) caused the reset.
 * * `widget`: The reset came from the widget. The user likely clicked the reset button within the widget.
 * * `agent`: The reset came from the agent - this currently does not happen but may in the future.
 *
 * @public
 */
export type WidgetResetTrigger = "widget" | "root" | "agent";

/**
 * @internal
 */
export interface WidgetProgress {
  current: number;
  total: number;
}

/**
 * @internal
 */
export interface WidgetStateData {
  state: WidgetState;
  /**
   * Localization key, such as `t_init` or `t_expired`.
   */
  text: string;
  progress: WidgetProgress | null;
  debug: string | null;

  /**
   * The value to be put in the (hidden) form field, in other words the value that gets sent to the server
   * as proof that the captcha was completed succesfully.
   */
  response: SentinelResponse | string;

  error?: WidgetErrorData;
}

/**
 * @public
 */
export interface WidgetErrorData {
  /**
   * The error code.
   */
  code: WidgetErrorCode;
  /**
   * Localization key, such as `t_verification_failed`.
   */
  title?: string;
  /**
   * More details about the error to help debugging.
   * This value is not localized and will change between versions.
   *
   * You can print this to the console, but make sure not to depend on it in your code.
   */
  detail: string;
}

/**
 * The options object you can pass to the `widget.reset()` method.
 * @public
 */
export interface WidgetResetOptions {
  /**
   * You usually don't set this yourself, defaults to `root` for user code.
   * @internal
   */
  trigger?: WidgetResetTrigger;
}

/**
 * Options when creating a widget programmatically.
 * @public
 */
export interface CreateWidgetOptions {
  /**
   * The HTML element to mount to, usually this is an element with class `.frc-captcha`.
   */
  element: HTMLElement;
  /**
   * Sitekey of your application, starts with `FC`.
   */
  sitekey?: string;

  /**
   * The name of the field in the form that is set, defaults to `frc-captcha-response`.
   */
  formFieldName?: string | null;

  /**
   * A custom endpoint from which the agent and widgets are loaded.
   */
  apiEndpoint?: string | "eu" | "global";

  /**
   * Language code such as "en" for English or "de" for German.
   * Defaults to automatic language detection.
   *
   * Usually you should not set this yourself and instead let the widget detect the language automatically.
   */
  language?: string;

  /**
   * The start mode determines the behavior around automatic activation of the widget.
   * Activation here means the challenge gets requested and gets solved. Defaults to `"focus"`.
   *
   * * `"auto"`: the widget gets activated as soon as it is created.
   * * `"focus"`: the widget gets activated as soon as the form above it is focused.
   * * `"none"`: The widget does not start automatically at all, the user needs to press the widget.
   */
  startMode?: StartMode;

  /**
   * The theme for the widget.
   *
   * * `"light"` (default): a light theme with a white background.
   * * `"dark"`: a dark theme with a dark background.
   * * `"auto"`: the theme is automatically chosen based on the user's system preferences.
   */
  theme?: "light" | "dark" | "auto";
}

/**
 * Used internally only.
 * @internal
 */
export interface _WidgetRootCallbacks {
  /**
   * Called when the widget is reset.
   * This can be caused because the widget was reset programmatically, or by someone clicking the reset button in the widget.
   */
  onReset: (opts: WidgetResetOptions) => void;
  /**
   * Called when the widget is destroyed.
   * This is caused by the website's code calling `widget.destroy()`.
   */
  onDestroy: () => void;
  /**
   * Called when the widget is triggered from within the root page.
   *
   * This is caused by the website's code calling `widget.start()`, by the widget being automatically triggered, or by the user focusing the form in `focus` mode.
   */
  onTrigger: (data: { trigger: _RootTrigger }) => void;
}

/**
 * Used internally only, this is the data injected into newly created widget handles.
 * @internal
 */
export interface _WidgetHandleOpts {
  /**
   * ID for the widget
   */
  id: string;
  /**
   * The options passed when creating the widget.
   */
  createOpts: CreateWidgetOptions;
  callbacks: _WidgetRootCallbacks;
  registered: Promise<undefined>;
}
