/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { _FocusTrigger, _RootTrigger, _TriggerBase } from "../types/trigger";
import { StartMode } from "../types/widget";

/**
 * @internal
 */
export function getTrigger(
  type: "auto" | "focus" | "programmatic",
  startMode: StartMode,
  el: HTMLElement,
  ev?: FocusEvent | UIEvent,
): _RootTrigger {
  const p = window.performance;
  const t = p ? p.now() : 0;
  const bcr = el.getBoundingClientRect();

  const trigger: _TriggerBase = {
    v: 1,
    tt: type,
    pnow: t,
    sm: startMode,
    el: {
      bcr: [bcr.left, bcr.top, bcr.width, bcr.height],
      con: document.body.contains(el),
    },
    stack: new Error().stack || "",

    we: !!window.event,
    weit: !!window.event && !!window.event.isTrusted,
  };

  if (ev) {
    (trigger as _FocusTrigger).ev = {
      ts: ev.timeStamp,
      rt: !!(ev as FocusEvent).relatedTarget,
      // @ts-ignore: not present in every browser
      eot: !!ev.explicitOriginalTarget,
      it: ev.isTrusted,
    };
  }

  // We save some code with this type conversion instead of constructing the different types independently.
  return trigger as _RootTrigger;
}
