/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Returns time zone name on a best-effort basis.
 *
 * @private
 */
export function tz(): string | undefined {
  const intl = window.Intl;
  if (!intl || !intl.DateTimeFormat) {
    return;
  }
  const dtf = new intl.DateTimeFormat();
  if (!dtf || !dtf.resolvedOptions) {
    return;
  }

  return dtf.resolvedOptions().timeZone;
}
