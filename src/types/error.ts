/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * Error codes that can be returned by the widget.
 *
 * * `"network_error"`: The user's browser could not connect to the Friendly Captcha API.
 * * `"sitekey_invalid"`: The sitekey is invalid.
 * * `"sitekey_missing"`: The sitekey is missing.
 * * `"other"`: Some other error occurred.
 *
 * In all cases it's the best practice to enable the "submit" button when the widget errors, so that the user can still
 * perform the action despite not having solved the captcha.
 *
 * @public
 */
export type WidgetErrorCode = "network_error" | "sitekey_invalid" | "sitekey_missing" | "other";
