/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export type FrameParams = {
  /**
   * Compatibility version for if we change the framedata format in the future.
   */
  v: string;

  /**
   * The version of the friendly captcha js bundle
   */
  sdk_v: string;

  /**
   * Communication ID, should be unique within the page. 8 bytes of entropy is enough.
   */
  comm_id: string;

  /**
   * Agent ID for given API endpoint origin.
   */
  agent_id: string;

  /**
   * Session ID, random client-side generated nonce.
   */
  sess_id: string;

  /**
   * Session count, how manieth page this is in the session.
   */
  sess_c: string;

  /**
   * Origin of the host page
   */
  origin: string;

  /**
   * Clientside timestamp in milliseconds since epoch as a string.
   */
  ts: string;

  lang?: string;

  sitekey?: string;

  /**
   * The theme to use for the widget.
   * One of `light`, `dark`, `auto`.
   */
  theme?: string;

  expire?: string;
};
