/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import test from "ava";
import { IFrameCommunicationTarget } from "../../src/communication/iframeTarget.js";

test.before(() => {
  globalThis.document = { location: { origin: "https://localhost:1234" } } as any;
});

// An iframe that was removed from the document has a `null` contentWindow.
function detachedIFrame() {
  return { src: "https://global.frcapi.com/api/v2/captcha/agent", contentWindow: null } as any;
}

function attachedIFrame(posted: any[]) {
  return {
    src: "https://global.frcapi.com/api/v2/captcha/agent",
    contentWindow: { postMessage: (msg: any) => posted.push(msg) },
  } as any;
}

function agentTarget(element: any) {
  return new IFrameCommunicationTarget({ id: "a_1", type: "agent", element, onReady: () => {} });
}

const msg = { _frc: 1, from_id: "w_1", to_id: "a_1", type: "widget_hello" } as any;

test("send to a ready target whose iframe was removed does not throw", (t) => {
  const target = agentTarget(detachedIFrame());
  target.ready = true;

  t.notThrows(() => target.send(msg));
});

test("becoming ready with buffered messages after the iframe was removed does not throw", (t) => {
  const target = agentTarget(detachedIFrame());
  target.send(msg);

  t.notThrows(() => target.setReady(true));
  t.is(target.buffer.length, 0);
});

test("buffered messages are still delivered to an attached iframe", (t) => {
  const posted: any[] = [];
  const target = agentTarget(attachedIFrame(posted));
  target.send(msg);

  target.setReady(true);
  target.send(msg);

  t.deepEqual(posted, [msg, msg]);
});
