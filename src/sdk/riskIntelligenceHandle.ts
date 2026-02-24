/*!
 * Copyright (c) Friendly Captcha GmbH 2026.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { RiskIntelligenceGenerateData } from "../types/riskIntelligence";
import { StartMode } from "../types/widget";
import { createManagedInputElement, executeOnceOnFocusInEvent, findParentFormElement, fireFRCEvent } from "./dom";

const DEFAULT_FORM_FIELD_NAME = "frc-risk-intelligence-token";

/**
 * This provides a handle for configuring and managing a Risk Intelligence request
 * via an HTML element.
 *
 * This class is only instantiated by the SDK - do not create a handle yourself.
 *
 * @public
 */
export class RiskIntelligenceHandle {
  /**
   * The element that configures the Risk Intelligence request,
   * and under which the hidden input element is mounted.
   */
  private readonly e: HTMLElement;

  /**
   * This will be undefined if we explicitly asked for no hidden form field.
   */
  private hiddenFormEl?: HTMLInputElement;

  private timeout: number | null = null;

  /**
   * A function that closes over configuration parameters from the HTML element's
   * `data-*` attributes, used for requesting Risk Intelligence.
   */
  private requestRiskIntelligence: () => Promise<RiskIntelligenceGenerateData>;

  /**
   * The field in the form that should be set, `null` if no form field should be set.
   * You usually don't want to change this.
   *
   * Defaults to `"frc-risk-intelligence-token"`.
   */
  private formFieldName: string | null;

  private startMode: StartMode;

  constructor(opts: Options) {
    this.e = opts.element;
    if (!this.e) throw new Error("No element provided for mounting Risk Intelligence handle.");
    (this.e as any).frcRiskIntelligence = this;

    this.formFieldName = opts.formFieldName === undefined ? DEFAULT_FORM_FIELD_NAME : opts.formFieldName;
    if (this.formFieldName !== null) {
      this.hiddenFormEl = createManagedInputElement(this.e, this.formFieldName);
    }
    this.startMode = opts.startMode || "focus";
    this.requestRiskIntelligence = opts.riskIntelligence;
    this.handleStartMode();
  }

  handleStartMode() {
    if (this.startMode === "none") {
      console.warn('Risk Intelligence <div> found with data-start="none" (no-op), skipping...', this.e);
    } else if (this.startMode === "auto") {
      this.request();
    } else {
      const parentForm = findParentFormElement(this.e);
      if (!parentForm) {
        console.warn(
          'Risk Intelligence <div> with startMode of "focus" found without a parent <form> element, skipping...',
          this.e,
        );
      } else {
        executeOnceOnFocusInEvent(parentForm, this.request);
      }
    }
  }

  request() {
    this.requestRiskIntelligence()
      .then((data) => {
        if (this.timeout !== null) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          fireFRCEvent(this.e, {
            name: "frc:riskintelligence.expire",
          });
        }, data.expiresAt - Date.now());

        if (this.hiddenFormEl) {
          this.hiddenFormEl.value = data.token;
        }

        fireFRCEvent(this.e, {
          name: "frc:riskintelligence.complete",
          token: data.token,
          expiresAt: new Date(data.expiresAt),
        });
      })
      .catch((error) => {
        fireFRCEvent(this.e, {
          name: "frc:riskintelligence.error",
          error: {
            code: error.code,
            detail: error.detail,
          },
        });
      });
  }
}

interface Options {
  element: HTMLElement;
  formFieldName?: string;
  startMode?: StartMode;
  riskIntelligence: () => Promise<RiskIntelligenceGenerateData>;
}
