/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { SDKTestFramework } from "./framework";
import { SDKTestWidget } from "./widget";

// Polyfill for String.startsWith
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, "startsWith", {
    value: function (search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}

function main() {
  const widget = new SDKTestWidget();
  const framework = new SDKTestFramework(widget);
  window.sdktest = framework;
}

main();
