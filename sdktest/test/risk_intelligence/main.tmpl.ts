import { FriendlyCaptchaSDK } from "../../../dist/sdk.js";
import { sdktest } from "../../sdktestlib/sdk.js";

sdktest.description("sdk.riskIntelligence() returns a valid token and future expiry");

const sdk = new FriendlyCaptchaSDK();
sdk.attach();

sdktest.test({ name: "risk intelligence returns a token with valid length and future expiresAt" }, async (t) => {
  const data = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  t.assert.truthy(typeof data.token === "string", "token should be a string");
  t.assert.truthy(data.token.length > 0, "token should be non-empty");
  t.assert.truthy(data.expiresAt > Date.now(), "expiresAt should be in the future");
});

sdktest.test({ name: "risk intelligence token is cached" }, async (t) => {
  const { token } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  const { token: secondToken } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });

  t.assert.equal(token, secondToken);
});

sdktest.test({ name: "risk intelligence token cache can be bypassed" }, async (t) => {
  const { token } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  const { token: secondToken } = await sdk.riskIntelligence({
    sitekey: "{{.Config.Sitekey}}",
    bypassCache: true,
  });

  t.assert.notEqual(token, secondToken);
});

sdktest.test({ name: "risk intelligence token cache can be cleared" }, async (t) => {
  const { token } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  await sdk.clearRiskIntelligence();
  const { token: secondToken } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  t.assert.notEqual(token, secondToken);
});

sdktest.test({ name: "risk intelligence token cache can be selectively cleared" }, async (t) => {
  const { token } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  await sdk.clearRiskIntelligence({ sitekey: "FCNONEXISTENT" });
  const { token: secondToken } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  t.assert.equal(token, secondToken);
  await sdk.clearRiskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  const { token: thirdToken } = await sdk.riskIntelligence({ sitekey: "{{.Config.Sitekey}}" });
  t.assert.notEqual(token, thirdToken);
});

sdktest.test({ name: "risk intelligence rejects with an invalid sitekey" }, async (t) => {
  try {
    await sdk.riskIntelligence({ sitekey: "invalid" });
    throw "fail";
  } catch (error: any) {
    t.assert.notEqual("fail", error);
    t.assert.equal("sitekey_invalid", error.code);
    t.assert.equal("sitekey invalid", error.detail);
  }
});

sdktest.test({ name: "risk intelligence rejects with missing sitekey" }, async (t) => {
  try {
    await sdk.riskIntelligence({});
    throw "fail";
  } catch (error: any) {
    t.assert.notEqual("fail", error);
    t.assert.equal("sitekey_missing", error.code);
    t.assert.equal("sitekey missing", error.detail);
  }
});

sdktest.test({ name: "risk intelligence on div creates an input with a token" }, async (t) => {
  const el = document.getElementById("just-risk-intelligence");
  const rih = (el as any).frcRiskIntelligence;
  const completePromise = t.assert.riskIntelligenceHandleCompletes(rih);

  const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  textInput.focus();

  const { token, expiresAt } = await completePromise;
  t.assert.truthy(typeof token === "string", "token should be a string");
  t.assert.truthy(token.length > 0, "token should be non-empty");
  t.assert.truthy(expiresAt > Date.now(), "expiresAt should be in the future");
});

sdktest.test({ name: "div can have both risk intelligence and captcha" }, async (t) => {
  const el = document.getElementById("risk-intelligence-and-captcha");
  const rih = (el as any).frcRiskIntelligence;
  const widget = (el as any).frcWidget;
  const rihPromise = t.assert.riskIntelligenceHandleCompletes(rih);
  const widgetPromise = t.assert.widgetCompletes(widget);

  const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  textInput.focus();

  await rihPromise;
  await widgetPromise;
});
