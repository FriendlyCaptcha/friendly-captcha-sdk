/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { get, set, createStore, UseStore } from "idb-keyval";
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
 * IndexedDB can be problematic because of the [Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using)
 *
 * In order:
 *   - IndexedDB
 *   - In Memory store (i.e. a Map<string, string>)
 *
 * If {`sess`} is true, then we only use session storage (with a fallback to in-memory store).
 *
 * @internal
 */
export class Store {
  // Initialized in setup()
  private idb!: UseStore;

  private storePrefix: string;

  /**
   * Memoized storage access (so we don't continously ask)
   */
  private _hasSA?: boolean;

  /**
   * Fallback memory-only store
   */
  private mem = new Map<string, string>();

  public constructor(prefix: string) {
    this.storePrefix = prefix;
  }

  /**
   * @returns Returns whether we have storage access
   */
  public setup(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._hasSA !== undefined) {
        return resolve(this._hasSA);
      }

      try {
        // Safari prior to ~2020 doesn't support indexedDB in iframes.
        indexedDB.open("");
      } catch (e) {
        return resolve((this._hasSA = false));
      }

      // Browser is old and doesn't support storage access API
      if (!document.hasStorageAccess) {
        // If `hasStorageAccess` is not available, we can assume we have storage access.
        return resolve((this._hasSA = true));
      }

      document
        .hasStorageAccess()
        .then((hasSA) => {
          this._hasSA = hasSA;
          if (!this._hasSA) {
            // Is this useful?
            console.debug("FRC has no storage access");
          } else {
            // Setup custom store, so we never clash with existing stuff.
            this.idb = createStore("friendlycaptcha", "frc");
          }
          return resolve(this._hasSA);
        })
        .catch(reject);
    });
  }

  get(key: string, opts: { p: boolean }): Promise<string | undefined> {
    return this.setup().then((hasSA: boolean) => {
      const storeKey = this.storePrefix + SEPARATOR + key;

      if (opts.p) { // Use persistent storage (i.e. indexedDB).
        if (hasSA) return get(storeKey, this.idb);
        return this.mem.get(key);
      }

      // Only get from session storage (w/ memory fallback).
      try {
        const sessValue = sessionStorage.getItem(storeKey);
        return sessValue === null ? undefined : sessValue;
      } catch (e) {
        /* Ignore error, fallback to memory */
      }
      return this.mem.get(key);
    });
  }

  set(key: string, value: string | undefined, opts: { p: boolean }): Promise<void> {
    return this.setup().then((hasSA: boolean) => {
      const storeKey = this.storePrefix + SEPARATOR + key;
  
      if (opts.p) { // Use persistent storage (i.e. indexedDB).
        if (hasSA) return set(storeKey, value, this.idb);

        if (value === undefined) {
          this.mem.delete(key);
        } else {
          this.mem.set(key, value);
        }
      } else {
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
    });
  }

  /** Has storage access, populated after any `set` or `get` has been completed. */
  public hasSA() {
    return this._hasSA;
  }
}
