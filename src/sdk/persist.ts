/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { get, set, createStore, UseStore } from "idb-keyval";
import { randomId } from "../util/random";

const prefix = "frcv2_";

let didIncrease = false;
let sc = "0";

/**
 * @internal
 */
export function sessionCount() {
  if (!didIncrease) {
    let scnumber = 0;
    try {
      scnumber = parseInt(sessionStorage.getItem(prefix + "sc") || "", 10);
    } catch (e) {
      /* Ignore error */
    }

    if (isNaN(scnumber)) scnumber = 0;
    scnumber++;
    sc = scnumber.toString();

    try {
      sessionStorage.setItem(prefix + "sc", sc);
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
    id = sessionStorage.getItem(prefix + "sid");
  } catch (e) {
    return "__" + randomId(10);
  }

  if (!id) {
    id = randomId(12);
    sessionStorage.setItem(prefix + "sid", id!);
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

      try { // Safari prior to ~2020 doesn't support indexedDB in iframes.
        indexedDB.open("")
      } catch(e) {
        return resolve((this._hasSA = false));
      }

      // Browser is old and doesn't support storage access API
      if (!document.hasStorageAccess) {
        // If `hasStorageAccess` is not available, we can assume we have storage access.
        return resolve(this._hasSA = true);
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

  get(key: string): Promise<string | undefined> {
    return this.setup().then((hasSA: boolean) => {
      if (hasSA) return get(prefix + this.storePrefix + key, this.idb);
      return this.mem.get(key);
    });
  }

  set(key: string, value: string | undefined): Promise<void> {
    return this.setup().then((hasSA: boolean) => {
      if (hasSA) return set(prefix + this.storePrefix + key, value, this.idb);
      if (value === undefined) {
        this.mem.delete(key);
      } else {
        this.mem.set(key, value);
      }
    });
  }

  /** Has storage access, populated after any `set` or `get` has been completed. */
  public hasSA() {
    return this._hasSA;
  }
}
