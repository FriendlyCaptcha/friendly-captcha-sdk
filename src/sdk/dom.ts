/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import type { FRCEventData } from "./events";

export function findCaptchaElements() {
  const elements = document.querySelectorAll(".frc-captcha");
  return elements;
}

/**
 * Traverses parent nodes until a <form> is found, returns null if not found.
 */
export function findParentFormElement(element: HTMLElement): HTMLFormElement | null {
  while (element.tagName !== "FORM") {
    element = element.parentElement as HTMLElement;
    if (!element) {
      return null;
    }
  }
  return element as HTMLFormElement;
}

/**
 * Add listener to specified element that will only fire once on focus.
 */
export function executeOnceOnFocusInEvent(element: HTMLElement, listener: (this: HTMLElement, fe: FocusEvent) => any) {
  element.addEventListener("focusin", listener, { once: true, passive: true });
}

/**
 * Sets the style of an element if it is not already set. This is useful for allowing users to override styles.
 * @internal
 */
export function styleIfNotAlreadySet(
  el: HTMLElement,
  name: Exclude<keyof CSSStyleDeclaration, "length" | "parentRule">,
  value: string,
) {
  if (el.style[name] === "") {
    el.style[name as any] = value;
  }
}

/**
 * @internal
 */
export function setWidgetRootStyles(el: HTMLElement) {
  const sinas = styleIfNotAlreadySet;
  sinas(el, "position", "relative");
  sinas(el, "height", "70px");
  sinas(el, "padding", "0");
  sinas(el, "width", "316px");
  sinas(el, "maxWidth", "100%");
  sinas(el, "maxHeight", "100%");
  sinas(el, "overflow", "hidden");
  sinas(el, "borderRadius", "4px");
}

/**
 * @internal
 */
export function removeWidgetRootStyles(el: HTMLElement) {
  el.removeAttribute("style");
}

export function runOnDocumentLoaded(func: () => any) {
  if (document.readyState !== "loading") {
    func();
  } else {
    document.addEventListener("DOMContentLoaded", func);
  }
}

/**
 * Creates a DOM event for given element with given data in a way that works for ancient browsers.
 * @param element Element that should emit the event.
 * @param eventData Payload for the event.
 * @internal
 */
export function fireFRCEvent(element: HTMLElement, eventData: FRCEventData) {
  let event;
  if (typeof window.CustomEvent === "function") {
    event = new CustomEvent(eventData.name, {
      bubbles: true,
      detail: eventData,
    });
  } else {
    // Fallback for IE11 and other very old browsers
    event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventData.name, true, false, eventData);
  }
  element.dispatchEvent(event);
}

/**
 * Traverses parent nodes until an element with the `lang` attribute set is found and returns its value, returns null if not found.
 */
export function findFirstParentLangAttribute(element: HTMLElement): string | null {
  while (!element.lang) {
    element = element.parentElement as HTMLElement;
    if (!element) {
      return null;
    }
  }
  return element.lang;
}
