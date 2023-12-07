/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Message as ToRootMessage, EnvelopedMessage } from "../types/messages.js";
import { flatPromise } from "../util/flatPromise.js";
import { IFrameCommunicationTarget } from "./iframeTarget.js";
import { CommunicationTarget, CommunicationTargetType } from "./target.js";

function isAllowedOrigin(origin: string, allowedOrigins: Set<string>): boolean {
  return origin === "*" || allowedOrigins.has(origin);
}

/**
 * Cross-iframe communication bus that runs on the root website, it handles communication
 * between the root page, and the agent and widgets.
 * @internal
 */
export class CommunicationBus {
  /**
   * Messages sent from this set of origins will be considered, all others are ignored.
   * Perhaps the website this code runs on has more cross-origin message passing happening, we don't want to interfere.
   */
  origins: Set<string> = new Set();

  // We use a map here to prevent the need to add a Map polyfill in the widget.
  targets: Record<string, CommunicationTarget> = {};

  /** Some messages that expect an answer may be handled twice if two SDKs are present. Here we keep track of those and deliver them only once. */
  answered: Set<string> = new Set();

  /**
   * Called upon receiving a message intended for consumption by the root itself, which is the host page
   * that contains the widgets and agent iframes.
   */
  onReceiveRootMessage: (msg: EnvelopedMessage<ToRootMessage>) => void = () => {};

  constructor() {
    window.addEventListener("message", (ev) => {
      // console.debug("[FRC bus]", ev.data);
      this.onReceive(ev);
    });
  }

  /**
   * Adds a listener for root messages.
   * @internal
   */
  public listen(onReceiveRootMessage: (msg: EnvelopedMessage<ToRootMessage>) => void) {
    let orig = this.onReceiveRootMessage;
    this.onReceiveRootMessage = (msg) => {
      orig(msg);
      onReceiveRootMessage(msg);
    };
  }

  /**
   * Add an origin to allow messages from.
   * @internal
   */
  public addOrigin(origin: string) {
    this.origins.add(origin);
  }

  /**
   * Send from the local root
   * @param msg
   * @internal
   */
  public send(msg: EnvelopedMessage<ToRootMessage>) {
    if (msg.from_id) {
      const messageSender = this.targets[msg.from_id];
      if (!messageSender) {
        console.error(`[bus] Unexpected message from unknown sender ${msg.from_id}`, msg);
        return;
      }

      // The first message sent from the iframes are announcement messages.
      // When we first receive an announcement we can mark them as ready to receive messages.
      // In other words: the iframe source loaded fully and JS is executing.
      if (msg.type === "widget_announce" || msg.type === "agent_announce") {
        messageSender.setReady(true);
      }
    }

    // This message expects an answer, it has a "return id"
    // Some messages may be answered twice by different SDKs (such as "get root signals"), here we
    // make sure we drop any duplicate answers to the same target
    const rid = (msg as any).rid;
    if (rid) {
      if (this.answered.has(rid + msg.to_id)) {
        // We already answered this message, ignore it.
        return;
      }
      this.answered.add(rid + msg.to_id);
    }

    if (msg.to_id === "") {
      this.onReceiveRootMessage(msg);
      return;
    }

    const messageTarget = this.targets[msg.to_id];
    if (!messageTarget) {
      console.error(`[bus] Unexpected message to unknown target ${msg.to_id}`, msg);
      return;
    }

    messageTarget.send(msg);
  }

  private onReceive(ev: MessageEvent) {
    if (!isAllowedOrigin(ev.origin, this.origins)) {
      // This may be an attempt at abuse or it's simply another iframe sending messages.
      // We silently ignore the message. For dev purposes we currently print a debug message.
      console.debug("Friendly Captcha communication bus ignored message from origin " + ev.origin, this.origins);
      return;
    }

    const msg = ev.data as EnvelopedMessage<ToRootMessage>;
    if (!msg._frc) return; // Message unrelated to Friendly Captcha.
    this.send(msg);
  }

  /**
   * @param ct
   * @internal
   */
  public registerTarget(ct: CommunicationTarget) {
    this.targets[ct.id] = ct;
  }

  /**
   * @internal
   */
  public registerTargetIFrame(
    type: CommunicationTargetType,
    id: string,
    iframe: HTMLIFrameElement,
    timeout: number,
  ): Promise<"registered" | "timeout"> {
    const fp = flatPromise<"registered">();
    // Create a promise that resolves to `"timeout"` after some time.
    let timeoutPromise = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), timeout));
    const t = new IFrameCommunicationTarget({
      id: id,
      element: iframe,
      type: type,
      onReady: () => fp.resolve("registered"),
    });
    this.registerTarget(t);

    return Promise.race([fp.promise, timeoutPromise]);
  }

  /**
   * @internal
   */
  public removeTarget(id: string) {
    delete this.targets[id];
  }
}
