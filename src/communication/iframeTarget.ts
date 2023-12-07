/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { EnvelopedMessage, Message } from "../types/messages";
import { originOf } from "../util/url";
import { CommunicationTarget, CommunicationTargetType } from "./target";

/**
 * @internal
 */
export class IFrameCommunicationTarget implements CommunicationTarget {
  id: string;
  type: CommunicationTargetType;

  /**
   * If null the element has not been created yet, perhaps it's time to do so?
   */
  element: HTMLIFrameElement | null;

  origin: string;

  /**
   * We have received a message from this target at any point
   */
  ready: boolean = false;

  /**
   * Messages that couldn't be delivered yet as the target isn't ready to receive messages.
   */
  buffer: EnvelopedMessage<Message>[] = [];

  onReady: () => void;

  constructor(opts: { id: string; element: HTMLIFrameElement; type: CommunicationTargetType; onReady: () => void }) {
    this.id = opts.id;
    this.type = opts.type;
    this.element = opts.element;
    this.onReady = opts.onReady;

    this.origin = originOf(opts.element.src);
  }

  public send(msg: EnvelopedMessage<Message>) {
    if (this.ready) {
      this.element!.contentWindow!.postMessage(msg, this.origin);
    } else {
      this.buffer.push(msg);
    }
  }

  public setReady(ready: boolean) {
    this.onReady();
    this.ready = ready;
    if (this.ready) {
      this.flush();
    }
  }

  private flush() {
    for (let i = 0; i < this.buffer.length; i++) {
      this.element!.contentWindow!.postMessage(this.buffer[i], this.origin);
    }
    this.buffer = [];
  }
}
