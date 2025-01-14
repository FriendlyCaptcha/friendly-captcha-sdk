/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { sessionCount, sessionId } from "../sdk/persist";
import {
  BehaviorSignal,
  DeviceMotion,
  DeviceOrientation,
  MouseEnterMouseLeaveSignal,
  MouseMoveSignal,
  OnlineMetricStateVector,
  RootSignalsV1Raw,
  TouchMoveSignal,
} from "../types/signals";
import { windowPerformanceNow } from "../util/performance";
import { RootTraceRecord, patchNativeFunctions } from "./collectStacktrace";
import { buildOnlineMetric } from "./online";

// Shorthand to save some characters. Saving `document.addEventListener` into a variable does not work for all events without `.apply()` or `.bind()`.
const x = "addEventListener";
const M = Math;

/**
 * Singleton signals object. If we create multiple SDKs we do not want different Signals objects.
 */
let ssig: Signals | undefined;

/**
 * Returns true if the browser is an Android device based on the user agent string (very naively).
 * @internal
 */
function isAndroidUA() {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Computes rolling stats of a variable.
 * Retrigger continuously resets the timer when subsequent "on" events happen.
 * @internal
 */
function onOffEventMetric(
  onEventName: string,
  offEventName: string,
  retrigger: boolean = false,
  target: HTMLElement | Document = document.body,
): OnlineMetricStateVector {
  const m = buildOnlineMetric();
  let on = false; // Current state
  let ts: number;

  target[x](onEventName, (ev) => {
    if (!on || retrigger) {
      ts = ev.timeStamp;
      on = true;
    }
  });
  target[x](offEventName, (ev) => {
    if (on) {
      m.add(ev.timeStamp - ts);
      on = false;
    }
  });

  return m.s;
}

/**
 * @internal
 */
function eventCounts(events: string[]): number[] {
  const out: number[] = []; // We can't use Array.fill() because we want to support IE11 without polyfills.
  for (let i = 0; i < events.length; i++) {
    out.push(0);
    document[x](events[i], (_) => out[i]++);
  }
  return out;
}

/**
 * @internal
 */
function keyCountMetric(): [number, number, number, number, number, number, number, number] {
  const out: [number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0];
  const m: Record<number, number> = {
    8: 1, // Backspace
    46: 1, // Delete
    9: 2, // Tab
    45: 3, // Insert
    17: 4, // Control
    13: 5, // Enter
    37: 6, // Arrow keys
    38: 6,
    39: 6,
    40: 6,
    33: 7, // Page up/down
    34: 7,
  };

  document[x]("keydown", (ev) => {
    const kc = ev.keyCode;
    if (m[kc]) {
      out[m[kc]]++;
    } else if (kc >= 112 && kc <= 123)
      // F-keys
      out[0]++;
  });
  return out;
}

/**
 * @internal
 */
function euclidean2d(x0: number, x1: number, y0: number, y1: number) {
  return M.sqrt(M.pow(x0 - x1, 2) + M.pow(y0 - y1, 2));
}

function vector3Length(x: number, y: number, z: number) {
  return M.sqrt(M.pow(x, 2) + M.pow(y, 2) + M.pow(z, 2));
}

/**
 * @internal
 * Angle difference for input in [-180, 180]
 */
function deltaAngle(a: number, b: number) {
  let angle = b - a;
  angle += angle > 180 ? -360 : angle < -180 ? 360 : 0;
  return angle;
}

export interface SignalsOptions {
  disableEvalPatching?: boolean;
}

/**
 * Signals collects browser and user behavior data from the page where the widget is embedded.
 * The code is deliberately rather minimal to save on payload size.
 *
 * An important design consideration is that the signals should not be able to be used to identify a user or what the user entered on the page.
 * @internal
 */
export class Signals {
  /**
   * Last mousemove event
   */
  private mm?: MouseEvent;
  /** Last touch event */
  private tm?: TouchEvent;

  /** Distinct touch event radius count */
  private rn: number = 0;
  private bh: BehaviorSignal;

  // Whether patching of window.eval is disabled.
  private dep: boolean;

  /** Counter */
  private i = 0;

  private smel: MouseEnterMouseLeaveSignal = {
    n: 0,
    ts: 0,
    d: 0,
  };

  private takeTraceRecords: () => RootTraceRecord[];

  constructor(opts: SignalsOptions) {
    const $: "mouse" = "mouse";

    // Set up mouse enter leave signals
    const sm = this.smel;
    const updateMouseEnterMouseLeave = (e: MouseEvent) => {
      // Assumes mouseenter always happens before mouseleave.
      if (!sm.n) {
        sm.fts = e.timeStamp;
        sm.fxy = [e.clientX, e.clientY, e.screenX, e.screenY];
      }
      sm.n++;
      if (e.type === $ + "leave") {
        sm.d += e.timeStamp - sm.ts;
      }
      sm.ts = e.timeStamp;
      sm.xy = [e.clientX, e.clientY];
    };

    const d = document;
    const b = d.body;
    b[x](($ + "enter") as "mouseenter", updateMouseEnterMouseLeave);
    b[x](($ + "leave") as "mouseleave", updateMouseEnterMouseLeave);

    this.bh = {
      onoff: {
        kdu: onOffEventMetric("keydown", "keyup"),
        cse: onOffEventMetric("compositionstart", "compositionend"),
        mdu: onOffEventMetric($ + "down", $ + "up"),
        mle: onOffEventMetric($ + "leave", $ + "enter"),
        med: onOffEventMetric($ + "enter", $ + "down", true),
        semd: onOffEventMetric("scrollend", $ + "down", true, d),
        se: onOffEventMetric("scroll", "scrollend", false, d),
        pdc: onOffEventMetric("pointerdown", "pointercancel", true),
        mmc: onOffEventMetric($ + "move", "click", true),
        tse: onOffEventMetric("touchstart", "touchend"),
        fikd: onOffEventMetric("focusin", "keydown", true),
      },
      nev: eventCounts([
        $ + "out",
        "pointercancel",
        "focus",
        "focusin",
        "blur",
        "visibilitychange",
        "copy",
        "paste",
        "cut",
        "contextmenu",
        "click",
        "auxclick",
        "wheel",
        "resize",
      ]) as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ],
      nk: keyCountMetric(),
      mov: this.setupMovementMetrics(),
      dm: this.setupMotionMetrics(),
      do: this.setupOrientationMetrics(),
    };

    this.dep = opts.disableEvalPatching || false;
    this.takeTraceRecords = patchNativeFunctions(opts);
  }

  private setupMovementMetrics(): {
    d: OnlineMetricStateVector;
    v: OnlineMetricStateVector;
    t: OnlineMetricStateVector;
    ns: number;
  } {
    let intervalHandle: number | undefined = undefined;
    let sample: [type: 0 | 1, ts: number, x: number, y: number][] = []; // type: 0 = mouse, 1 = touch

    const interval = 50; // milliseconds

    const duration = buildOnlineMetric();
    const distance = buildOnlineMetric();
    const vel = buildOnlineMetric();

    const out = {
      t: duration.s,
      v: vel.s,
      d: distance.s,
      ns: 0,
    };

    const b = document.body;
    const updateFunc = () => {
      const lastSample = sample[sample.length - 1];

      // if no movement happened since last sample
      if (
        sample.length >= 10_000 / interval || // A reasonable upper bound
        (lastSample &&
          ((lastSample[0] && this.tm!.timeStamp === lastSample[1]) || // Last sample was touch and timestamp is unchanged.
            (!lastSample[0] && this.mm!.timeStamp === lastSample[1]))) // Last sample was mouse and timestamp is unchanged.
      ) {
        clearInterval(intervalHandle!);
        intervalHandle = undefined;

        if (sample.length === 1) {
          out.ns++;
          sample = [];
          return;
        }

        const firstSample = sample[0];
        duration.add(lastSample[1] - firstSample[1]);
        distance.add(euclidean2d(lastSample[2], firstSample[2], lastSample[3], firstSample[3]));

        for (let i = 1; i < sample.length; i++) {
          const c = sample[i]; // current
          const p = sample[i - 1]; // previous
          const dist = euclidean2d(c[2], p[2], c[3], p[3]) * 1000; // *1000 to compute dist per second instead of per millisecond
          const dt = c[1] - p[1]; // dt can not be 0 here, as it would be have meant the end of the sample
          vel.add(dist / dt);
        }
        sample = [];
        return;
      }
      let evType: 0 | 1 = 0;

      // // Decide what kind of event we are tracking here, mouse or touch.
      // // * If we have a previous sample it's that one
      // // * Otherwise it's the one that happened most recently in case both have happened in the past.
      // //
      // // This is written in such a way to save some lines..
      if (lastSample) evType = lastSample[0];
      else if (this.mm && this.tm)
        evType = this.mm.timeStamp > this.tm.timeStamp ? 0 : 1; // Latest event has precedence
      else if (!this.mm) evType = 1; // If we only have a touch event, use that.

      if (evType) {
        // Is touch type
        const t = this.tm!.touches[0];
        // I don't think t can be undefined, but better safe than sorry.
        t && sample.push([1, this.tm!.timeStamp, t.screenX, t.screenY]);
      } else {
        // Is mouse type
        sample.push([0, this.mm!.timeStamp, this.mm!.screenX, this.mm!.screenY]);
      }
    };

    b[x]("mousemove", (e) => {
      this.mm = e;
      if (intervalHandle === undefined) {
        updateFunc();
        intervalHandle = setInterval(updateFunc, interval);
      }
    });

    let lastRadius = -1;
    b[x]("touchmove", (e) => {
      this.tm = e;
      const t = e.touches[0];
      if (t) {
        const newRadius = t.radiusX + t.radiusY * 1.234; // Poor man's hash
        if (newRadius !== lastRadius) {
          lastRadius = newRadius;
          this.rn++;
        }
      }
      if (intervalHandle === undefined) {
        updateFunc();
        intervalHandle = setInterval(updateFunc, interval);
      }
    });

    return out;
  }

  /**
   * @internal
   */
  private setupMotionMetrics(): DeviceMotion<OnlineMetricStateVector> {
    const acc = buildOnlineMetric();
    const rr = buildOnlineMetric();

    const sig: DeviceMotion<OnlineMetricStateVector> = {
      n: 0,
      ts: 0,
      ac: acc.s,
      rr: rr.s,
      i: 0,
      g: false,
    };

    if (!isAndroidUA()) {
      // We limit this signal to Android phones, which is generally the only place where we would expect to get
      // this data anyhow.
      return sig;
    }

    window[x]("devicemotion", (e) => {
      sig.ts = e.timeStamp;
      sig.i = e.interval;
      sig.g = !e.acceleration;
      const a = e.acceleration || e.accelerationIncludingGravity;
      if (a) {
        acc.add(vector3Length(a.x!, a.y!, a.z!));
      }

      const r = e.rotationRate;
      if (r) {
        rr.add(vector3Length(r.alpha!, r.beta!, r.gamma!));
      }
    });

    return sig;
  }

  /**
   * @internal
   */
  private setupOrientationMetrics(): DeviceOrientation<OnlineMetricStateVector> {
    const gd = buildOnlineMetric();
    const bd = buildOnlineMetric();

    const sig: DeviceOrientation<OnlineMetricStateVector> = {
      fts: 0,
      ts: 0,
      gd: gd.s,
      bd: bd.s,
    };

    if (!isAndroidUA()) {
      // We limit this signal to Android phones, which is generally the only place where we would expect to get
      // this data anyhow.
      return sig;
    }

    let hasPrevious: true | undefined;
    window[x]("deviceorientation", (e) => {
      if (e.gamma == null || e.beta == null || e.alpha == null) return;

      sig.ts = e.timeStamp;
      sig.a = e.alpha!;
      sig.b = e.beta!;
      sig.g = e.gamma!;

      if (!hasPrevious) {
        sig.fts = sig.ts;
        hasPrevious = true;
      } else {
        gd.add(deltaAngle(e.gamma, sig.g));
        bd.add(deltaAngle(sig.b, e.beta));
      }
    });

    return sig;
  }

  /**
   * @internal
   */
  public gmm(): MouseMoveSignal | undefined {
    const e = this.mm;
    return (
      e && {
        xy: [
          e.clientX,
          e.clientY,
          e.screenX,
          e.screenY,
          e.offsetX,
          e.offsetY,
          e.pageX,
          e.pageY,
          e.movementX,
          e.movementY,
        ],
        ts: e.timeStamp,
      }
    );
  }

  /**
   * @internal
   */
  public gtm(): TouchMoveSignal | undefined {
    const tm = this.tm;
    const tt = tm && tm.touches;
    const tm0 = tt && tt[0];
    return (
      tm &&
      tm0 && {
        id: tm0.identifier,
        xy: [tm0.clientX, tm0.clientY, tm0.screenX, tm0.screenY, tm0.pageX, tm0.pageY],
        r: [tm0.radiusX, tm0.radiusX, tm0.rotationAngle, tm0.force],
        n: tt.length,
        ts: tm.timeStamp,
        rn: this.rn,
      }
    );
  }

  /**
   * @internal
   */
  get(widgetId: string): RootSignalsV1Raw {
    const b = document.body;
    const w = window;
    const p = w.performance;

    const sig: RootSignalsV1Raw = {
      v: 1,
      i: ++this.i,
      hl: history.length,
      fe: !!window.frameElement,
      dep: this.dep,
      wid: widgetId,
      sc: parseInt(sessionCount(false)),
      sid: sessionId(),
      conv: 0,
      t: {
        pnow: windowPerformanceNow(),
        pto: (p && p.timeOrigin) || 0,
        ts: Date.now(),
      },
      dims: {
        d: [
          w.innerWidth,
          w.innerHeight,
          w.outerWidth,
          w.outerHeight,
          w.screenX,
          w.screenY,
          w.pageXOffset,
          w.pageYOffset,
          b.clientWidth,
          b.clientHeight,
        ],
        dpr: w.devicePixelRatio,
      },
      mel: this.smel,
      mm: this.gmm(),
      tm: this.gtm(),
      bh: this.bh,
      stack: new Error().stack || "",
      trc: this.takeTraceRecords(),
    };

    return sig;
  }
}

/**
 * Returns the global signals object.
 * @internal
 */
export function getSignals(opts: SignalsOptions) {
  return ssig || (ssig = new Signals(opts));
}
