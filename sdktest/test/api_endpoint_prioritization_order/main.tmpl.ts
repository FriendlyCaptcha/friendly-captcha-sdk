/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description(
  "Create 3 widgets, configuring the API endpoint in 3 different ways, and ensure that the configuration prioritization is correct."
);

const sitekey = "{{.Config.Sitekey}}";

const datasetAPIEndpoint = "{{.Config.APIEndpoint}}";
const widgetOptionEndpoint = "https://create-widget-opts.frcapi.com";
const sdkOptionEndpoint = "https://create-sdk-opts.frcapi.com";

// Configure the SDK with an API endpoint.
const sdk = new FriendlyCaptchaSDK({ apiEndpoint: sdkOptionEndpoint });

// Should mount a new widget to the div with class `frc-captcha`.
// This widget should be configured via its `data-api-endpoint` HTML attribute.
sdk.attach();

// This widget's endpoint is manually configured with an `apiEndpoint`.
const manuallyConfiguredWidget = sdk.createWidget({
  element: document.getElementById("create-widget-option"),
  sitekey,
  apiEndpoint: widgetOptionEndpoint,
});

// This widget should get its `apiEndpoint` via the configuration based to the
// SDK constructor.
const sdkConfiguredWidget = sdk.createWidget({
  element: document.getElementById("sdk-option"),
  sitekey,
});

// Returns true if an agent iframe exists with the given endpoint in its `src` attribute.
function agentWithSrcExists(endpoint: string) {
  const iframes = document.querySelectorAll(".frc-i-agent");
  for (const i of iframes) {
    if (i.getAttribute("src")?.includes(endpoint)) {
      return true;
    }
  }
  return false;
}

// Returns true if a widget iframe (corresponding to the passed widget id)
// exists and has the given endpoint in its `src` attribute.
function widgetIFrameHasCorrectSrc(id: string, endpoint: string) {
  const iframe = document.querySelector(`[data--frc-frame-id="${id}"]`);
  return iframe?.getAttribute("src")?.includes(endpoint);
}

sdktest.test({ name: "three widgets present" }, async (t) => {
  t.require.numberOfWidgets(3);
});

// For each of the 3 widgets, which have been configured with an API endpoint in a different way,
// make sure that the expected widget iframe has the correct endpoint *and* that there is
// an agent iframe for that endpoint.
sdktest.test({ name: "iframes exist for widgets with each configured endpoint" }, async (t) => {
  const attachedWidget = t.getWidget();
  t.assert.truthy(agentWithSrcExists(datasetAPIEndpoint), `missing agent iframe for ${datasetAPIEndpoint}`);
  t.assert.truthy(
    widgetIFrameHasCorrectSrc(attachedWidget.id, datasetAPIEndpoint),
    `data-attr-configured widget with id ${attachedWidget.id} does not have an iframe with src of ${datasetAPIEndpoint}`,
  );

  t.assert.truthy(agentWithSrcExists(widgetOptionEndpoint), `missing agent iframe for ${widgetOptionEndpoint}`);
  t.assert.truthy(
    widgetIFrameHasCorrectSrc(manuallyConfiguredWidget.id, widgetOptionEndpoint),
    `widget-options-configured widget with id ${manuallyConfiguredWidget.id} does not have an iframe with src of ${widgetOptionEndpoint}`,
  );

  t.assert.truthy(agentWithSrcExists(sdkOptionEndpoint), `missing agent iframe for ${sdkOptionEndpoint}`);
  t.assert.truthy(
    widgetIFrameHasCorrectSrc(sdkConfiguredWidget.id, sdkOptionEndpoint),
    `sdk-options-configured widget with id ${sdkConfiguredWidget.id} does not have an iframe with src of ${sdkOptionEndpoint}`,
  );
});
