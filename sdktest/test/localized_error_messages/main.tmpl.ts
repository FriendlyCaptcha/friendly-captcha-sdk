/*!
 * Copyright (c) Friendly Captcha GmbH 2025.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description(
  "Purely visual check: error messages should appear in the correct language (English, German, Arabic) and fallback to English for unsupported languages.",
);
