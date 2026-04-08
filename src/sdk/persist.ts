/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { randomId } from "../util/random";

export const SESSION_COUNT_KEY = "frc_sc";
export const SESSION_ID_KEY = "frc_sid";

const SEPARATOR = "__";

let didIncrease = false;
let sc = "0";
let sid = "__" + randomId(10);

/**
 * @internal
 */
export function sessionCount(increase: boolean) {
  if (!didIncrease) {
    let scnumber = 0;
    try {
      scnumber = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || "", 10);
    } catch (e) {
      /* Ignore error */
    }

    if (isNaN(scnumber)) scnumber = 0;
    increase && scnumber++;
    sc = scnumber.toString();

    try {
      sessionStorage.setItem(SESSION_COUNT_KEY, sc);
    } catch (e) {
      /* Ignore error */
    }
  }
  return sc;
}

/**
 * @internal
 */
export function sessionId() {
  let id: string | null;
  try {
    id = sessionStorage.getItem(SESSION_ID_KEY);
  } catch (e) {
    return sid;
  }

  if (!id) {
    id = randomId(12);
    sessionStorage.setItem(SESSION_ID_KEY, id!);
  }
  return id;
}

/**
 * Key value storage with different layers.
 *
 * It has support for:
 *   - SessionStorage
 *   - In Memory store (i.e. a `Map<string, string>`)
 *
 * @internal
 */
export class Store {
  private storePrefix: string;

  /**
   * Fallback memory-only store
   */
  private mem = new Map<string, string>();

  public constructor(prefix: string) {
    this.storePrefix = prefix;
  }

  get(key: string): string | undefined {
    const storeKey = this.storePrefix + SEPARATOR + key;

    // Only get from session storage (w/ memory fallback).
    try {
      const sessValue = sessionStorage.getItem(storeKey);
      return sessValue === null ? undefined : sessValue;
    } catch (e) {
      /* Ignore error, fallback to memory */
    }
    return this.mem.get(key);
  }

  set(key: string, value: string | undefined): void {
    const storeKey = this.storePrefix + SEPARATOR + key;

    // Only store in session storage (w/ memory fallback).
    try {
      if (value === undefined) {
        this.mem.delete(key);
        sessionStorage.removeItem(storeKey);
      } else {
        this.mem.set(key, value);
        sessionStorage.setItem(storeKey, value);
      }
    } catch (e) {
      /* Ignore error */
    }
  }
}
