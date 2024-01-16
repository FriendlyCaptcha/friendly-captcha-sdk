/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { windowPerformanceNow } from "../util/performance";

/**
 * @internal
 */
export type RootTraceRecord = {
  /** Date.now() */
  d: number;
  /** Performance.now() */
  pnow: number;
  /** Name */
  n: string;
  /** Stack trace */
  st: string;
};

const isFunc = function (value: unknown): value is Function {
  return typeof value === "function";
};

/**
 * Defensively patch native functions to capture stack traces.
 */
export const takeRecords = (function () {
  const queue: RootTraceRecord[] = [];

  /** Used for deeply patching toString. The Map implementation is necessary */
  const origPatchMap = new Map<Function, Function>();

  const takeRecords = function () {
    const records = queue.splice(0, queue.length);
    return records;
  };

  const w = window;

  const $window = (function getRealmSafely() {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      (document.body || document.head).appendChild(iframe);
      // Iframe must be added to DOM before accessing contentWindow
      const $window = iframe ? iframe.contentWindow : 0;
      iframe.remove();
      return $window || w;
    } catch (e) {
      return w;
    }
  })();

  const originalFuncToString = Function.prototype.toString;
  const newFuncToString = function toString(this: unknown, ...args: unknown[]) {
    if (isFunc(this)) {
      return;
    }
    const patchedRef = isFunc(this) ? origPatchMap.get(this) : false;
    const ref = this === newFuncToString ? originalFuncToString : patchedRef ? patchedRef : this;
    return originalFuncToString.apply(ref, args as []);
  };
  Function.prototype.toString = newFuncToString as () => string;

  const getStackSafely = function FC_DummyTrace() {
    /**!
     * ----------------------
     * Do not worry if you see an error occur here. This is not
     * a real error, it just captures the current stack trace
     */
    const Error = ($window as any).Error || w.Error; // The fallback `w.Error` is required for Safari 10.1 (and possibly later versions).
    return Error("FriendlyCaptcha_DummyTrace").stack || ""; // The fallback here is required for IE11, where stack may be undefined.
    /**!
     * ----------------------
     */
  };

  // We save some bundle size by using these constants.
  const p = "prototype";

  // Safari 10.1 (and 10.3 on iOS) and earlier does not have `EventTarget` defined.
  const dispatchEvent = w.EventTarget ? w.EventTarget[p].dispatchEvent : {};

  /**
   * The names of patches must not change,  as they are used to
   * identify the source of the stack trace by the Agent and Backend
   */
  const patches: [string, object, string][] = [
    // Getters as non-function
    ["Document." + p + ".documentElement", w.Document[p], "documentElement"],
    ["Element." + p + ".shadowRoot", w.Element[p], "shadowRoot"],
    ["Node." + p + ".nodeType", w.Node[p], "nodeType"],
    // Values holding functions
    ["eval", w, "eval"],
    ["Object.is", w.Object, "is"],
    ["Array." + p + "e.slice", w.Array[p], "slice"],
    ["Document." + p + ".querySelectorAll", w.Document[p], "querySelectorAll"],
    ["Document." + p + ".createElement", w.Document[p], "createElement"],
    ["EventTarget." + p + ".dispatchEvent", dispatchEvent, "dispatchEvent"],
    ["Promise." + p + "e.constructor", w.Promise[p], "constructor"],
  ];

  patches.forEach(function ([name, target, prop]) {
    const descriptor = Object.getOwnPropertyDescriptor(target, prop);
    const hasGetterOrSetter = descriptor && (descriptor.get || descriptor.set);

    if (!descriptor) {
      return;
    } else if (hasGetterOrSetter) {
      if (!descriptor.get) {
        return;
      }
    } else {
      if (typeof descriptor.value !== "object" && typeof descriptor.value !== "function") {
        return;
      }
    }

    const newAccessor = function fcPatch(this: unknown, ...args: unknown[]) {
      const record: RootTraceRecord = {
        d: Date.now(),
        pnow: windowPerformanceNow(),
        n: name,
        st: getStackSafely(),
      };
      queue.push(record);

      /**!
       * ----------------------
       * If you see an error here in a stack trace, you should assume
       * that the error is from other source code deeper in the
       * stack trace as FriendlyCaptcha wraps native functions.
       */
      return (hasGetterOrSetter ? descriptor.get : descriptor.value).apply(this, args);
      /**!
       * ----------------------
       */
    };

    // Patching in rare occasions will throw
    try {
      const descriptorValue = hasGetterOrSetter ? (descriptor.get ? descriptor.get() : undefined) : descriptor.value();
      if (descriptorValue) {
        newAccessor.length = descriptorValue.length;
        newAccessor.name = descriptorValue.name;
      }
    } catch (e) {}

    try {
      Object.defineProperty(target, prop, {
        ...descriptor,
        [hasGetterOrSetter ? "get" : "value"]: newAccessor,
      });
      origPatchMap.set(newAccessor, hasGetterOrSetter ? descriptor.get : descriptor.value);
    } catch (e) {}
  });

  return takeRecords;
})();
