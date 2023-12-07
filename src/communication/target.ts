/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { EnvelopedMessage, Message } from "../types/messages.js";

/**
 * @internal
 */
export type CommunicationTargetType = "widget" | "agent";

/**
 * @internal
 */
export interface CommunicationTarget<Msg extends Message = Message> {
  id: string;

  send(msg: EnvelopedMessage<Msg>): void;
  setReady(ready: boolean): void;

  ready: boolean;
}
