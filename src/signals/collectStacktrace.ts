/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @internal
 */
export type RootTraceRecord = {
  dateNow: number;
  perfNow: number;
  name: string;
  stack: string;
};

/**
 * @internal
 */
export type ProcessedTraceRecord = [
  /** performance now, at first occurance */
  number,
  /** patch source */
  number,
  /** stack depth */
  number,
  /** bottom frame */
  string,
];

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

  const $window = (function getRealmSafely() {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      (document.body || document.head).appendChild(iframe);
      // Iframe must be added to DOM before accessing contentWindow
      const $window = iframe ? iframe.contentWindow : 0;
      iframe.remove();
      return $window || window;
    } catch (e) {
      return window;
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
    const Error = ($window as any).Error;
    return Error("FriendlyCaptcha_DummyTrace").stack;
    /**!
     * ----------------------
     */
  };

  /**
   * The names of patches must not change,  as they are used to
   * identify the source of the stack trace by the Agent and Backend
   */
  const patches: [string, object, string][] = [
    // Getters as non-function
    ["Document.prototype.documentElement", window.Document.prototype, "documentElement"],
    ["Element.prototype.shadowRoot", window.Element.prototype, "shadowRoot"],
    ["Node.prototype.nodeType", window.Node.prototype, "nodeType"],
    // Values holding functions
    ["eval", window, "eval"],
    ["Object.is", window.Object, "is"],
    ["Array.prototype.slice", window.Array.prototype, "slice"],
    ["Document.prototype.querySelectorAll", window.Document.prototype, "querySelectorAll"],
    ["Document.prototype.createElement", window.Document.prototype, "createElement"],
    ["EventTarget.prototype.dispatchEvent", window.EventTarget.prototype, "dispatchEvent"],
    ["Promise.prototype.constructor", window.Promise.prototype, "constructor"],
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
      const perf = window.performance;
      const record: RootTraceRecord = {
        dateNow: Date.now(),
        perfNow: (perf && perf.now()) || 0,
        name,
        stack: getStackSafely(),
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
