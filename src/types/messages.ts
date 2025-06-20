/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Inter-iframe messages.
import { SentinelResponse } from "./sentinel";
import { RootSignalsV1Raw } from "./signals";
import { _RootTrigger } from "./trigger";
import { WidgetErrorData, WidgetMode, WidgetState, WidgetStateData } from "./widget";

export type Message = ToAgentMessage | ToWidgetMessage | ToRootMessage;

export type ToAgentMessage =
  | WidgetAnnounceMessage
  | WidgetTriggerMessage
  | AgentRequestInfoMessage
  | RootDestroyWidgetMessage
  | RootResetWidgetMessage
  | RootTriggerWidgetMessage
  | RootStoreSetReplyMessage
  | RootStoreGetReplyMessage
  | RootSignalsGetReplyMessage;
export type ToWidgetMessage = WidgetSetStateMessage | AgentInfoMessage;
export type ToRootMessage =
  | AgentAnnounceMessage
  | WidgetResetMessage
  | WidgetLanguageChangeMessage
  | RootSetResponseMessage
  | RootStoreSetMessage
  | RootStoreGetMessage
  | RootSignalsGetMessage;

export type EnvelopedMessage<M extends Message> = {
  from_id: string;
  /**
   * If the to_id is the empty string the message will not be forwarded to any party.
   */
  to_id: string | "";
  /**
   * This field is to make sure it is a message sent by our system, otherwise it is hard to distinguish between messages
   * sent by user plugins or website-specific JS.
   */
  _frc: 1;
} & M;

// Messages from widget to root

/**
 * This message is sent when the user presses the "reset" button within the widget.
 */
export interface WidgetResetMessage {
  type: "widget_reset";
  state: WidgetState;
}

/**
 * This message is sent when user changes the widget language.
 */
export interface WidgetLanguageChangeMessage {
  type: "widget_language_change";
  language: string;
}

// Messages from widget to the agent

/**
 * This message is sent when the user presses the main button "triggering" the challenge.
 */
export interface WidgetTriggerMessage {
  type: "widget_trigger";
  state: WidgetState;
  signals: unknown;
  trigger: unknown;
}

export interface WidgetAnnounceMessage {
  type: "widget_announce";
  sitekey: string;
  lang: string;
  mode: WidgetMode;
  signals: any;
}

export interface AgentRequestInfoMessage {
  type: "agent_request_info";
}

// Messages from the root to the agent

export interface RootTriggerWidgetMessage {
  type: "root_trigger_widget";
  trigger: _RootTrigger;
}

export interface RootResetWidgetMessage {
  type: "root_reset_widget";
}

export interface RootDestroyWidgetMessage {
  type: "root_destroy_widget";
}
// Messages to the widget from the agent

export interface WidgetSetStateMessage {
  type: "widget_set_state";
  data: WidgetStateData;
}

export interface AgentAnnounceMessage {
  type: "agent_announce";
}

export interface AgentInfoMessage {
  type: "agent_info";
  info: Record<string, any>;
}

export interface RootSetResponseMessage {
  type: "root_set_response";
  state: WidgetState;
  widget_id: string;
  response: SentinelResponse | string;
  error?: WidgetErrorData;
}

// Messages around state

export interface RootStoreSetMessage {
  type: "root_store_set";
  rid: string;
  key: string;
  value: string | undefined;
  p: boolean;
}

export interface RootStoreSetReplyMessage {
  type: "root_store_set_reply";
  rid: string;
  sa: boolean | undefined;
}

export interface RootStoreGetMessage {
  type: "root_store_get";
  rid: string;
  key: string;
  p: boolean;
}

export interface RootStoreGetReplyMessage {
  type: "root_store_get_reply";
  rid: string;
  value: string | undefined;
  sa: boolean | undefined;
}

// Related to root signals

export interface RootSignalsGetMessage {
  type: "root_signals_get";
  widget_id: string;
  rid: string;
}

export interface RootSignalsGetReplyMessage {
  type: "root_signals_get_reply";
  rid: string;
  value: RootSignalsV1Raw;
}
