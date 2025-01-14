/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/** Returns window.performance.now() if it is available, otherwise returns 0 */
export function windowPerformanceNow() {
    const p = window.performance;
    return p ? p.now() : 0
}
