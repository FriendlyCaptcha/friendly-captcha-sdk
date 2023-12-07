/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * This is approximately the same as `allow="clipboard-write"`
 * see: https://caniuse.com/?search=clipboard-write and https://caniuse.com/?search=userAgentData
 * This means that only in very select outdated Chrome versions the copy to clipboard won't work, which isn't the end of the world anyway.
 *
 * @internal
 */
// Note: we have to be careful with navigator so we don't get a ReferenceError in Node environments such as NextJS.
export const supportAllowClipboardWrite =
  typeof navigator !== "undefined" && (navigator as any).userAgentData !== undefined;
