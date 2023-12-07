/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { SDKTestResult } from "./types";
import { TestOpts, TestStatus } from "./types";

export class TestCaseResultWidget {
  private el: HTMLElement;
  private resultEl: HTMLParagraphElement;
  private opts: TestOpts;

  constructor(opts: TestOpts) {
    this.el = document.createElement("li");

    const container = document.createElement("div");
    this.el.appendChild(container);
    container.classList.add("sdktest-subresult-container");

    const h3 = document.createElement("h3");
    h3.innerText = opts.name;
    container.appendChild(h3);

    this.resultEl = document.createElement("p");
    container.appendChild(this.resultEl);

    this.opts = opts;
    this.setState({ rawErrors: [], status: "unstarted", errors: [] });
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  public setState(result: SDKTestResult): void {
    let text: string;
    const state = result.status;

    if (state === "fail") {
      text = `❌ FAIL: ${result.rawErrors.map((e) => e.toString())}`;
    } else if (state === "running") {
      text = `🏃‍♂️ RUNNING`;
    } else if (state === "skip") {
      text = `🦘 SKIP`;
    } else if (state === "pass") {
      text = `✅ PASS`;
    } else if (state === "unstarted") {
      text = `⏳ UNSTARTED`;
    } else {
      text = `🤔 UNKNOWN STATE: ${state}.`;
    }
    this.resultEl.textContent = text;
  }
}

export class SDKTestWidget {
  private widgetEl = document.querySelector(".sdktest") as HTMLElement;
  private startButtonEl = document.querySelector(".sdktest-start") as HTMLButtonElement;
  private subresultsEl = document.querySelector(".sdktest-subresults") as HTMLUListElement;
  private descriptionEl = document.querySelector(".sdktest-description") as HTMLButtonElement;

  public onstart: () => any = () => console.error("Nothing listening to start button");

  constructor() {
    this.startButtonEl.addEventListener("click", () => this.onstart());
    this.enterState("unstarted");
  }

  public enterState(state: TestStatus) {
    // Remove existing state classes
    this.widgetEl.classList.forEach((v) => {
      if (v.startsWith("state-")) {
        this.widgetEl.classList.remove(v);
      }
    });

    this.widgetEl.classList.add("state-" + state);
  }

  public appendToSubResults(w: TestCaseResultWidget) {
    this.subresultsEl.appendChild(w.getElement());
  }

  setDescription(description: string) {
    this.descriptionEl.textContent = description;
  }
}
