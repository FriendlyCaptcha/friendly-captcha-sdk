/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../dist/sdk";
import { SDKTestFramework } from "./framework";
import { SDKTestObject } from "./test";
import { TestCaseResultWidget } from "./widget";

declare global {
  interface Window {
    frcaptcha: FriendlyCaptchaSDK;
    sdktest: SDKTestFramework;
  }
}

export type TestStatus = "unstarted" | "running" | "fail" | "pass" | "skip";

export type TestOpts = {
  name: string;
  sdk?: FriendlyCaptchaSDK;
  timeout: number;
};
export type TestSuiteEntry = { opts: TestOpts; func: TestFunction; resultWidget: TestCaseResultWidget };
export type TestFunction = ((t: SDKTestObject) => void) | ((t: SDKTestObject) => Promise<void>);

export type TestSkipError = { _skipError: 1 };

export interface SDKTestError {
  __error__: "skip" | "assertion" | "timeout";
}

export type SDKTestResult = {
  status: TestStatus;
  rawErrors: Error[];
  errors: string[]
};

export type SDKTestSuiteResult = {
  status: TestStatus;
  results: SDKTestResult[];
};
