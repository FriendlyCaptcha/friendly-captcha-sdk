/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AssertionError, TimeoutError } from "./error";
import { SkipError } from "./error";
import { SDKTestObject } from "./test";
import { SDKTestResult, SDKTestSuiteResult, TestFunction, TestOpts, TestStatus, TestSuiteEntry } from "./types";
import { SDKTestWidget, TestCaseResultWidget } from "./widget";

const DEFAULT_TIMEOUT = 20_000;

export class SDKTestFramework {
  private widget: SDKTestWidget;
  private suite: TestSuiteEntry[] = [];
  private hasStarted: boolean = false;
  private state: TestStatus = "unstarted";

  constructor(widget: SDKTestWidget) {
    this.widget = widget;
    this.widget.onstart = () => this.start();
  }

  public setState(state: TestStatus) {
    if (state !== this.state) {
      this.state = state;
      this.widget.enterState(state);
    }
  }

  public async start() {
    if (this.hasStarted) {
      console.log("SDK Tests have already started.");
      return;
    }
    this.hasStarted = true;
    return this.run();
  }

  /**
   * Adds a description for the overall test suite
   */
  public description(description: string) {
    this.widget.setDescription(description);
  }

  /**
   * Add a test case
   */
  public test(popts: Partial<TestOpts>, func: TestFunction) {
    if (this.state !== "unstarted" && this.state !== "skip") {
      throw new Error("Tests can not be nested or added after tests have completed.");
    }

    const opts: TestOpts = {
      name: popts.name || this.suite.length.toString(), // We fall back to the index of the test in case no name is given.
      sdk: popts.sdk,
      timeout: popts.timeout || DEFAULT_TIMEOUT,
    };

    const resultWidget = new TestCaseResultWidget(opts);
    this.suite.push({ opts, func, resultWidget });
    this.widget.appendToSubResults(resultWidget);
  }

  private async run() {
    const numTests = this.suite.length;
    this.setState("running");

    const results: SDKTestResult[] = [];

    for (let i = 0; i < numTests; i++) {
      const test = this.suite[i];
      const testObj = new SDKTestObject(this, test.opts);
      const result: SDKTestResult = {
        errors: testObj.errors.map(s => s.toString()),
        rawErrors: testObj.errors,
        status: "running",
      };
      results.push(result);

      const setState = (state: TestStatus) => {
        result.status = state;
        test.resultWidget.setState(result);
      };

      try {
        setState("running");

        const timeoutPromise = new Promise<"__timeout">((r) => setTimeout(() => r("__timeout"), test.opts.timeout));
        const workPromise = test.func(testObj);

        const res = await Promise.race([workPromise, timeoutPromise]);
        if (res === "__timeout") {
          const err = new TimeoutError(test.opts.timeout);
          testObj.errors.push(err);
          throw err;
        }

        if (testObj.errors.length > 0) {
          setState("fail")
        } else {
          setState("pass");
        }
      } catch (e) {
        if (e instanceof SkipError) {
          setState("skip");
        } else if (e instanceof AssertionError) {
          setState("fail");
          console.error(`[sdktest] Assertion Error in test \"${test.opts.name || i}\":\n`, e);
          break;
        } else {
          setState("fail");
          testObj.errors.push(e);
          console.error(`[sdktest] Unexpected error in test \"${test.opts.name || i}\":\n`, e);
        }
      }
    }

    results.forEach(r => r.errors = r.rawErrors.map(s => s.toString()))

    const suiteResult: SDKTestSuiteResult = {
      status: "pass",
      results: results,
    };


    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "fail") {
        suiteResult.status = "fail";
        break;
      } else if (results[i].status === "skip") {
        suiteResult.status = "skip";
      }
    }

    this.widget.enterState(suiteResult.status);
    return suiteResult;
  }
}
