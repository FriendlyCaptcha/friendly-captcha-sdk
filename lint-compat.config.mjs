/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Config for `lint-compat.mjs` (`npm run lint:compat`), see "Browser compatibility" in the README.
// Paths are relative to this file.

const typedArrays = [
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
];

export default {
  tsconfig: "tsconfig.json",
  include: ["src/"],
  exclude: ["src/polyfill/"],

  // Built-in syntax checks of the script, by id. esbuild (`--target=es6`) lowers `?.`, `??` and object rest safely,
  // they are on anyway so we don't come to rely on that.
  syntax: [
    "objectSpread",
    "objectRest",
    "nullishCoalescing",
    "optionalChaining",
    "arraySpread",
    "asyncAwait",
    "generators",
    "forOf",
    "regexLookbehind",
    "regexSticky",
    "mapSetConstructorArgs",
    "mainElement",
    "eventListenerOptions",
    "classListMultipleArgs",
  ],

  // Members flagged by where they are declared, so e.g. `FormData.append` is fine but `HTMLElement.append` is not.
  // `{name}` in a message is replaced with the member name.
  members: [
    {
      owners: ["ObjectConstructor"],
      names: ["assign"],
      message: "`Object.assign` is not supported, use `mergeObject` from `util/object.ts`",
    },
    {
      owners: ["ObjectConstructor"],
      names: ["entries", "values", "fromEntries", "getOwnPropertyDescriptors"],
      message: "`Object.{name}` is not supported, use `Object.keys` or a `for ... in` loop",
    },
    {
      owners: ["ArrayConstructor"],
      names: ["from", "of"],
      message: "`Array.{name}` is not supported, use a for loop",
    },
    {
      owners: ["Array", "ReadonlyArray"].concat(typedArrays),
      names: ["findIndex", "find", "includes", "fill", "flat", "flatMap", "at", "copyWithin"],
      message: "`Array.{name}` is not supported, use a for loop or `indexOf`",
    },
    {
      owners: ["String"],
      names: ["startsWith", "endsWith", "includes", "repeat", "padStart", "padEnd", "trimStart", "trimEnd"],
      message: "`String.{name}` is not supported, see `util/string.ts`",
    },
    {
      owners: ["NumberConstructor"],
      names: [
        "isNaN",
        "isInteger",
        "isFinite",
        "isSafeInteger",
        "parseFloat",
        "parseInt",
        "EPSILON",
        "MAX_SAFE_INTEGER",
        "MIN_SAFE_INTEGER",
      ],
      message: "`Number.{name}` is not supported, use the global or a literal",
    },
    { owners: ["Promise"], names: ["finally"], message: "`Promise.finally` is not in our Promise polyfill" },
    {
      owners: ["PromiseConstructor"],
      names: ["allSettled", "any"],
      message: "`Promise.{name}` is not in our Promise polyfill",
    },
    {
      owners: ["ParentNode"],
      names: ["append", "prepend", "replaceChildren"],
      message: "`Element.{name}` is not supported, use `appendChild`/`insertBefore`",
    },
    {
      owners: ["ChildNode"],
      names: ["remove", "before", "after", "replaceWith"],
      message:
        "`Element.{name}` is not supported, use `removeElement` from `sdk/dom.ts`, `insertBefore` or `replaceChild`",
    },
    { owners: ["Element"], names: ["closest", "matches"], message: "`Element.{name}` is not supported in IE11" },
    {
      owners: ["NodeList", "NodeListOf", "DOMTokenList"],
      names: ["forEach"],
      message: "`forEach` on `NodeList`/`classList` is not supported, use a for loop",
    },
    {
      owners: ["HTMLElement"],
      names: ["innerText"],
      message: "`innerText` is not supported in Firefox <= 44, use `textContent`",
    },
    {
      owners: ["Map", "ReadonlyMap", "Set", "ReadonlySet"],
      names: ["keys", "values", "entries"],
      message:
        "`Map`/`Set` iterators need `for ... of` or `Array.from`, and misbehave with our polyfill, use `forEach`",
    },
    {
      owners: ["Math"],
      names: [
        "fround",
        "tanh",
        "trunc",
        "sign",
        "cbrt",
        "hypot",
        "log2",
        "log10",
        "log1p",
        "expm1",
        "sinh",
        "cosh",
        "asinh",
        "acosh",
        "atanh",
        "clz32",
        "imul",
      ],
      message: "`Math.{name}` is not supported, feature-check it and add `compat-ignore`",
    },
    { owners: ["Navigator"], names: ["sendBeacon"], message: "`navigator.sendBeacon` is not supported" },
    { owners: ["Element"], names: ["toggleAttribute"], message: "`Element.toggleAttribute` is not supported" },
    { owners: ["Node"], names: ["isConnected", "getRootNode"], message: "`Node.{name}` is not supported" },
  ],

  // Globals, unless a local declaration shadows them. `{name}` in a message is replaced with the global's name.
  // `Promise`, `Map`, `Set`, `WeakMap` and `WeakSet` are fine, `src/polyfill/` provides them.
  globals: [
    {
      names: [
        "globalThis",
        "URL",
        "URLSearchParams",
        "TextEncoder",
        "TextDecoder",
        "Event",
        "CustomEvent",
        "Symbol",
        "Proxy",
        "Reflect",
        "AbortController",
        "IntersectionObserver",
        "ResizeObserver",
        "fetch",
      ],
      message: "`{name}` is not supported and not polyfilled",
    },
  ],
};
