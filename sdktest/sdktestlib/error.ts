/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Note we have to patch the prototype of errors to fix `instanceof` calls, see:
// https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work

import { SDKTestError } from "./types";

export class SkipError extends Error implements SDKTestError {
    __error__ = 'skip' as const;

    constructor() {
        super(`test skipped`);
        Object.setPrototypeOf(this, SkipError.prototype);
    }
}

export class AssertionError extends Error implements SDKTestError {
    __error__ = 'assertion' as const;
    message: string;

    constructor(expected: any, actual: any, customMessage?: string) {
        const msg = customMessage || `Assertion Error.\nExpected: ${expected}\nActual: ${actual}`;
        super(msg);
        this.message = msg;
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}

export class TimeoutError extends Error implements SDKTestError {
    __error__ = 'timeout' as const;

    constructor(duration: number) {
        super(`Timeout after ${duration} milliseconds`);
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}