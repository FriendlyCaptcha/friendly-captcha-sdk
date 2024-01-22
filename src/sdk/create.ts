/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FrameParams } from "../types/frameParams";
import { CreateWidgetOptions } from "../types/widget";
import { sessionCount, sessionId } from "./persist";
import { supportAllowClipboardWrite } from "./supports";
import { encodeQuery } from "../util/url";
import { FriendlyCaptchaSDK } from "./sdk";
import { findFirstParentLangAttribute } from "./dom";

// Injected by esbuild
declare const SDK_VERSION: string;

const FRAME_ID_DATASET_FIELD = "FrcFrameId";
export const AGENT_FRAME_CLASSNAME = "frc-i-agent";
const WIDGET_FRAME_CLASSNAME = "frc-i-widget";
const WIDGET_PLACEHOLDER_CLASSNAME = "frc-widget-placeholder";

/**
 * @internal
 */
export function createAgentIFrame(frcSDK: FriendlyCaptchaSDK, agentId: string, src: string) {
  const frameParams: FrameParams = {
    origin: document.location.origin,
    sess_id: sessionId(),
    sess_c: sessionCount(true),
    comm_id: agentId,
    sdk_v: SDK_VERSION,
    v: "1",
    agent_id: agentId,
    ts: Date.now().toString(),
  };
  const el = document.createElement("iframe");
  el.className = AGENT_FRAME_CLASSNAME;
  el.dataset[FRAME_ID_DATASET_FIELD] = agentId;

  el.src = src + "?" + encodeQuery(frameParams);

  (el as any).frcSDK = frcSDK;

  const s = el.style;
  s.width = s.height = s.border = s.visibility = "0";
  s.display = "none";

  return el;
}

export function createWidgetIFrame(
  agentId: string,
  widgetId: string,
  widgetUrl: string,
  opts: CreateWidgetOptions,
): HTMLIFrameElement {
  const el = document.createElement("iframe");

  let language = opts.language;
  if (!language || language === "html") {
    language = findFirstParentLangAttribute(opts.element) || "";
  }

  const frameData: FrameParams = {
    origin: document.location.origin,
    sess_id: sessionId(),
    sess_c: sessionCount(true),
    comm_id: widgetId,
    sdk_v: SDK_VERSION,
    v: "1",
    agent_id: agentId,
    lang: language,
    sitekey: opts.sitekey || "",
    ts: Date.now().toString(),
  };

  if (opts.theme) {
    frameData.theme = opts.theme;
  }

  if (supportAllowClipboardWrite) {
    el.allow = "clipboard-write";
  }
  el.frameBorder = "0";

  el.src = widgetUrl + "?" + encodeQuery(frameData);
  el.className = WIDGET_FRAME_CLASSNAME;
  el.dataset[FRAME_ID_DATASET_FIELD] = widgetId;
  const s = el.style;
  s.border = s.visibility = "0";
  s.position = "absolute";
  s.height = s.width = "100%";

  s.display = "none";

  // Note: we must use `appendChild` instead of `append` for IE11.
  opts.element.appendChild(el);
  return el;
}

/**
 * Creates a placeholder box that is shown while the widget is loading.
 * This is useful if the widget takes a while to load, or never ends up loading: the user will see a box with some text
 * explaining what is going on instead of a blank error page.
 * @internal
 */
export function createWidgetPlaceholder(opts: CreateWidgetOptions) {
  const el = document.createElement("div");
  el.classList.add(WIDGET_PLACEHOLDER_CLASSNAME);
  const s = el.style;

  const isDark =
    opts.theme === "dark" ||
    (opts.theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  s.color = isDark ? "#fff" : "#222";
  s.backgroundColor = isDark ? "#171717" : "#fafafa";

  s.borderRadius = "4px";
  s.border = "1px solid";
  s.borderColor = "#ddd";
  s.padding = "8px";
  s.height = s.width = "100%";
  s.fontSize = "14px";

  setCommonTextStyles(s);
  opts.element.appendChild(el);
  return el;
}

/**
 * Set text styles that are common to the banner and the widget placeholder.
 */
function setCommonTextStyles(s: CSSStyleDeclaration) {
  s.textDecoration = s.fontStyle = "none";
  s.fontWeight = "500";
  s.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  s.lineHeight = "1";
  s.letterSpacing = "-0.0125rem";
}

export function createBanner(opts: CreateWidgetOptions) {
  const el = document.createElement("div");
  el.classList.add("frc-banner");

  const els = el.style;
  els.position = "absolute";
  els.bottom = "2px";
  els.right = "6px";
  els.lineHeight = "1";

  const a = document.createElement("a");
  a.href = "https://friendlycaptcha.com";
  a.rel = "noopener";

  const s = a.style;
  setCommonTextStyles(s);
  s.fontSize = "10px";
  s.color = "#777";
  s.letterSpacing = "-0.0125rem";
  a.target = "_blank";
  a.textContent = "Friendly Captcha";

  // A poor man's hover, we can't use the :hover pseudoclass with inline css.
  a.onmouseenter = () => (s.textDecoration = "underline");
  a.onmouseleave = () => (s.textDecoration = "none");

  // Note: we must use `appendChild` instead of `append` for IE11.
  el.appendChild(a);

  opts.element.appendChild(el);
}
