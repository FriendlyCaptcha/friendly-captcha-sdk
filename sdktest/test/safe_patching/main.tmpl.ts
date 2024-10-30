/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

// This gets set in a <script> tag inlined in the HTML file.
declare var ResizeObserver_toString: string;

sdktest.test({ name: "loading the SDK doesn't break the `toString()` method for native browser objects" }, t => {
  t.assert.equal(ResizeObserver_toString, ResizeObserver.toString());
});
