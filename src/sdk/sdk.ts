/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { StartMode, CreateWidgetOptions } from "../types/widget.js";
import { CommunicationBus } from "../communication/bus.js";
import { randomId } from "../util/random.js";
import { originOf } from "../util/url.js";
import {
  createBanner,
  createAgentIFrame,
  createWidgetIFrame,
  AGENT_FRAME_CLASSNAME,
  createWidgetPlaceholder,
} from "./create.js";
import { EnvelopedMessage, Message, RootSignalsGetMessage, ToAgentMessage, ToRootMessage } from "../types/messages.js";
import { findCaptchaElements, setWidgetRootStyles } from "./dom.js";
import { flatPromise } from "../util/flatPromise.js";
import { WidgetHandle } from "./widgetHandle.js";
import { Store } from "./persist.js";
import { Signals, getSignals } from "../signals/collect.js";
import { getSDKAPIEndpoint, resolveAPIEndpoint } from "./endpoint.js";
import { stringHasPrefix } from "../util/string.js";
import { mergeObject } from "../util/object.js";
import { _RootTrigger } from "../types/trigger.js";

const agentEndpoint = "/agent";
const widgetEndpoint = "/widget";

const FRAME_ID_DATASET_FIELD = "FrcFrameId";

/**
 * After a long interval we refresh the agent and widget iframes.
 * This is for users that leave their browser open for multiple days, it should prevent them from getting
 * into some weird state due to outdated versions of the page.
 */
const IFRAME_EXP_TIME = 1000 * 60 * 60 * 36; // 36 hours

/**
 * Options when creating a new SDK instance.
 * @public
 */
export interface FriendlyCaptchaSDKOptions {
  /**
   * Start the background agent (and solver) immediately, defaults to `true`.
   */
  startAgent?: boolean;
  /**
   * The API endpoint to use, defaults to `https://global.frcapi.com/api/v2/captcha`.
   *
   * Supports the following shortcuts:
   * - `eu` - `https://eu.frcapi.com/api/v2/captcha`
   * - `global` - `https://global.frcapi.com/api/v2/captcha`
   */
  apiEndpoint?: string | "eu" | "global";
}

/**
 * Singleton communication bus.
 * Multiple SDKs may be running at the same time, but they should all use the same bus.
 * This is lazily initialized in the SDK constructor.
 * @internal
 * */
let cbus: CommunicationBus | undefined;

/**
 * Number of SDKs created.
 * Ideally one should only ever create one SDK, but it is an easy mistake to make.
 * This allows us to warn the user if they create multiple SDKs, and surpress some expected (non-fatal) errors.
 * */
let sdkC = 0;

/**
 * Main entry point for V2 of the Friendly Captcha SDK. This class keeps track of widgets and allows you to create widgets programmatically.
 *
 * Generally there should only be one instance of this SDK in your website.
 * @public
 */
export class FriendlyCaptchaSDK {
  private baseURL: string;

  /**
   * Multiple agents may be running at the same time, this is the case if someone uses widgets with different endpoints on a single page.
   * This is a mapping from the origin to the IFrame.
   */
  private agents: Map<string, HTMLIFrameElement> = new Map();

  /**
   * A mapping from the agent ID to its local state.
   */
  private agentState: Map<string, { store: Store; origin: string }> = new Map();

  /**
   * Mapping of widget ID to the widget handle.
   */
  private widgets: Map<string, WidgetHandle> = new Map();

  /**
   * @internal
   */
  private bus: CommunicationBus;

  private _attached = flatPromise<WidgetHandle[]>();
  /**
   * A promise that resolves to all the widgets that are currently attached.
   * @public
   */
  public attached: Promise<WidgetHandle[]> = this._attached.promise;

  /**
   * @internal
   */
  private signals: Signals = getSignals();

  constructor(opts: FriendlyCaptchaSDKOptions = {}) {
    this.baseURL = resolveAPIEndpoint(opts.apiEndpoint || getSDKAPIEndpoint());
    cbus = cbus || new CommunicationBus();

    cbus.addOrigin(originOf(this.baseURL));
    cbus.listen((msg: EnvelopedMessage<Message>) => this.onReceiveMessage(msg as EnvelopedMessage<ToRootMessage>));
    this.bus = cbus;
    sdkC++;

    if (sdkC > 1) {
      console.warn(
        "Multiple Friendly Captcha SDKs created, this is not recommended. Please use a single SDK instance.",
      );
    }

    if (opts.startAgent !== false) {
      this.ensureAgentIFrame();
    }

    this.setupPeriodicRefresh();
  }

  private onReceiveMessage(msg: EnvelopedMessage<ToRootMessage>) {
    if (msg.type === "root_set_response") {
      const w = this.widgets.get(msg.widget_id);
      if (!w) {
        if (sdkC === 1) {
          console.warn(`Received set response message for widget ${msg.widget_id} that doesn't exist`);
        }
        return;
      }
      w.setState(msg);
    } else if (stringHasPrefix(msg.type, "root_store")) {
      this.handleStoreMessage(msg);
    } else if (msg.type === "root_signals_get") {
      this.handleSignalsGetMessage(msg);
    } else if (msg.type === "widget_reset") {
      // The user clicked the reset button within the widget.

      const w = this.widgets.get(msg.from_id);
      if (!w) {
        if (sdkC === 1) {
          console.warn(`Received reset message for widget ${msg.from_id} that doesn't exist`);
        }
        return;
      }
      w.reset({ trigger: "widget" });
    }
  }

  private handleSignalsGetMessage(msg: EnvelopedMessage<RootSignalsGetMessage>) {
    const sigs = this.signals.get(msg.widget_id);
    this.bus.send({
      type: "root_signals_get_reply",
      from_id: "",
      to_id: msg.from_id,
      _frc: 1,
      rid: msg.rid,
      value: sigs,
    });
  }

  private handleStoreMessage(msg: EnvelopedMessage<ToRootMessage>) {
    const from = msg.from_id;
    const s = this.agentState.get(from);
    if (!s) {
      // Should never happen
      console.error(`Store not found ${from}`);
      return;
    }

    if (msg.type === "root_store_get") {
      const v = s.store.get(msg.key).then((v) => {
        this.bus.send({
          type: "root_store_get_reply",
          from_id: "",
          to_id: from,
          _frc: 1,
          rid: msg.rid,
          value: v,
          sa: s.store.hasSA(),
        });
      });
    } else if (msg.type === "root_store_set") {
      s.store.set(msg.key, msg.value).then(() => {
        this.bus.send({
          type: "root_store_set_reply",
          from_id: "",
          to_id: from,
          _frc: 1,
          rid: msg.rid,
          sa: s.store.hasSA(),
        });
      });
    }
  }

  private getAPIUrls(apiURL?: string | { agent: string; widget: string }) {
    if (apiURL && typeof apiURL != "string") {
      return {
        agent: apiURL.agent,
        widget: apiURL.widget,
      };
    }
    let u = apiURL || this.baseURL;
    return {
      agent: u + agentEndpoint,
      widget: u + widgetEndpoint,
    };
  }

  /**
   * Creates an agent IFrame with the given API url (optional). Returns the Agent ID.
   * @param apiURL - The API URL to use, defaults to the one passed in the constructor.
   * @returns
   */
  private ensureAgentIFrame(apiURL?: string | { agent: string; widget: string }): string {
    const src = this.getAPIUrls(apiURL).agent;
    const origin = originOf(src);

    // We try to be idempotent - see if an iframe already exists for the given origin.
    let agentIFrames = document.getElementsByClassName(AGENT_FRAME_CLASSNAME) as HTMLCollectionOf<HTMLIFrameElement>;
    for (let index = 0; index < agentIFrames.length; index++) {
      const i = agentIFrames[index];
      if (originOf(i.src) === origin && i.dataset[FRAME_ID_DATASET_FIELD]) {
        return i.dataset[FRAME_ID_DATASET_FIELD] as string;
      }
    }

    const agentId = "a_" + randomId(12);
    const el = createAgentIFrame(this, agentId, src);

    this.agents.set(origin, el);
    this.agentState.set(agentId, { store: new Store(origin), origin: origin });
    document.body.appendChild(el);

    let retryLoadCounter = 1;
    const registerWithRetry = () => {
      // We multiply the timeout with the retry timeout, so that we don't retry too often.
      this.bus.registerTargetIFrame("agent", agentId, el, retryLoadCounter * 3000).then((status) => {
        if (status === "timeout") {
          if (retryLoadCounter > 15) {
            console.error("[Friendly Captcha] Failed to load agent iframe after 15 retries.");
            el.remove();
            this.agents.delete(origin);
            // We can consider reloading all widgets that use this agent ID.
            return;
          }
          console.warn("[Friendly Captcha] Retrying agent iframe load.");
          el.src += "&retry=" + retryLoadCounter++;
          registerWithRetry();
        }
      });
    };
    registerWithRetry();

    return agentId;
  }

  /**
   * @internal
   */
  private setupPeriodicRefresh() {
    let count = 1;
    setInterval(() => {
      const e = "&expire=" + count++;

      this.agents.forEach((el, origin) => {
        el.src += e;
      });
      this.widgets.forEach((w, id) => {
        const iframe = w.getElement().querySelector("iframe")!;
        iframe.src += e;
      });
    }, IFRAME_EXP_TIME);
  }

  /**
   * Attaches a widget to given element or elements if they are not attached to yet.
   *
   * You can pass one or more HTML elements to attach to, or undefined. If `undefined` is passed, the HTML page is scanned
   * for unattached widget elements (= elements with the `frc-captcha` class).
   *
   * Returns handles to the newly-attached elements.
   * @public
   */
  public attach(elements?: HTMLElement | HTMLElement[] | NodeListOf<Element>): WidgetHandle[] {
    if (elements === undefined) {
      elements = findCaptchaElements();
    }

    if (!(Array.isArray(elements) || elements instanceof NodeList)) {
      elements = [elements];
    }
    const newWidgets: WidgetHandle[] = [];
    for (let index = 0; index < elements.length; index++) {
      const hElement = elements[index] as HTMLElement;
      if (hElement && !hElement.dataset.attached) {
        const ds = hElement.dataset;
        const opts: CreateWidgetOptions = {
          element: hElement,
          sitekey: ds.sitekey,
          formFieldName: ds.formFieldName,
          apiEndpoint: ds.apiEndpoint,
          language: ds.lang,
          theme: ds.theme as "light" | "dark" | "auto", // Perhaps we should we check for valid values?
          startMode: ds.start as StartMode, // Perhaps we should we check for valid values?
        };
        newWidgets.push(this.createWidget(opts));
        hElement.dataset.attached = "1";
      }
    }

    const allWidgets = this.getAllWidgets();
    this._attached.resolve(allWidgets);
    this.attached = Promise.resolve(allWidgets);

    return newWidgets;
  }

  /**
   * Creates a Friendly Captcha widget with given options under given HTML element.
   * @public
   */
  public createWidget(opts: CreateWidgetOptions): WidgetHandle {
    const agentId = this.ensureAgentIFrame(opts.apiEndpoint);
    const widgetId = "w_" + randomId(12);

    const send = (msg: ToAgentMessage) => {
      const msgToSend = { from_id: widgetId, to_id: agentId, _frc: 1 };
      this.bus.send(mergeObject(msgToSend, msg));
    };

    const callbacks = {
      onDestroy: () => {
        send({ type: "root_destroy_widget" });
        this.bus.removeTarget(widgetId);
        this.widgets.delete(widgetId);
        opts.element.remove();
      },
      onReset: () => {
        send({ type: "root_reset_widget" });
      },
      onTrigger: (data: { trigger: _RootTrigger }) => {
        send({ type: "root_trigger_widget", trigger: data.trigger });
      },
    };

    const registered = flatPromise();
    const widgetHandle = new WidgetHandle({
      id: widgetId,
      createOpts: opts,
      callbacks,
      registered: registered.promise,
    });

    this.widgets.set(widgetId, widgetHandle);

    const widgetUrl = this.getAPIUrls(opts.apiEndpoint).widget;
    const wel = createWidgetIFrame(agentId, widgetId, widgetUrl, opts);
    const widgetPlaceholder = createWidgetPlaceholder(opts);
    setWidgetRootStyles(opts.element);
    createBanner(opts);

    const widgetPlaceholderStyle = widgetPlaceholder.style;
    widgetPlaceholder.textContent = "Anti-Robot check connecting...";

    let retryLoadCounter = 1;
    const registerWithRetry = () => {
      this.bus.registerTargetIFrame("widget", widgetId, wel, retryLoadCounter * 2500 + 2000).then((status) => {
        if (status === "timeout") {
          if (retryLoadCounter > 4) {
            console.error("[Friendly Captcha] Failed to load widget iframe after 4 retries.");
            widgetHandle.setState({
              state: "error",
              response: ".ERROR",
              error: { code: "network_error", detail: "Widget load timeout, stopped retrying" },
            });
            widgetPlaceholderStyle.borderColor = "#f00";
            widgetPlaceholderStyle.fontSize = "12px";
            widgetPlaceholder.textContent = `Anti-Robot check failed to connect to page or ${originOf(
              wel.src,
            )}\nCheck your connection and try again.`;
            return;
          }
          widgetPlaceholderStyle.backgroundColor = "#fee";
          widgetPlaceholderStyle.color = "#222";
          widgetPlaceholder.textContent = `Anti-Robot check took too long to connect.\n\nRetrying... (${retryLoadCounter})`;

          console.warn(`[Friendly Captcha] Retrying widget ${widgetId} iframe load.`);
          widgetHandle.setState({
            state: "error",
            response: ".ERROR",
            error: { code: "network_error", detail: "Widget load timeout, will retry." },
          });
          wel.src += "&retry=" + retryLoadCounter++;
          registerWithRetry();
        } else if (status === "registered") {
          // After successful registration, we remove the placeholder and show the widget.
          widgetPlaceholder.remove();
          wel.style.display = "";
        } else if (status === "registered") {
          // After successful registration, we remove the placeholder and show the widget.
          widgetPlaceholder.remove();
          wel.style.display = "";
        }
      });
    };
    registerWithRetry();
    registered.resolve();

    return widgetHandle;
  }

  /**
   * Returns all current widgets known about (in an unspecified order).
   * @public
   */
  public getAllWidgets(): WidgetHandle[] {
    // We use a workaround for old browser support. We can not count on spread operator or `Array.from` support.
    const out: WidgetHandle[] = [];
    this.widgets.forEach((w) => {
      out.push(w);
    });
    return out;
  }

  /**
   * Retrieves a widget by its widget ID.
   * @public
   */
  public getWidgetById(id: string): WidgetHandle | undefined {
    return this.widgets.get(id);
  }

  /**
   * Completely remove all widgets and background agents related to the SDK on this page.
   * @public
   */
  public clear() {
    this.widgets.forEach((w) => {
      w.destroy();
    });
    this.agents.forEach((el) => {
      el.remove();
    });
    this.agents.clear();
  }
}
