/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RootTraceRecord } from "../signals/collectStacktrace";

/**
 * 0   1   2   3   4    5    6
 * n, m1, m2, m3, m4, min, max
 * @internal
 */
export type OnlineMetricStateVector = [number, number, number, number, number, number, number];

/**
 * @internal
 */
export type RootSignalsV1Raw<MetricVectorType = OnlineMetricStateVector> = {
  /**
   * Compatibility version
   */
  v: 1;

  /** Counter of signal computation */
  i: number;

  /** Widget ID */
  wid: string;

  /**
   * Used internally.
   */
  conv: number;

  /**
   * `history.length`
   */
  hl: number;
  /**
   * `!!window.frameElement`
   */
  fe: boolean;

  /**
   * Whether patching of window.eval is disabled.
   */
  dep: boolean;

  sid: string;
  sc: number;

  t: TimestampSignal;

  mm?: MouseMoveSignal;
  tm?: TouchMoveSignal;
  mel: MouseEnterMouseLeaveSignal;
  dims: DimensionsSignal;
  bh: BehaviorSignal<MetricVectorType>;

  stack: string;
  trc: RootTraceRecord[];
};

/**
 * @internal
 */
export type TimestampSignal = {
  /**
   * Timestamp (`Date.now()`)
   */
  ts: number;

  /**
   * Performance time origin, zero if not supported
   */
  pto: number;
  /**
   * Performance time now, zero if not supported
   */
  pnow: number;
};

/**
 * @internal
 */
export type MouseMoveSignal = {
  /** Position/change
   * * Client xy
   * * Screen xy
   * * Offset xy
   * * Page xy
   * * Movement xy
   */
  xy: [number, number, number, number, number, number, number, number, number, number];

  /** Timestamp */
  ts: number;
};

/**
 * @internal
 */
export type MouseEnterMouseLeaveSignal = {
  /** First state timestamp */
  fts?: number;

  /** First state pos
   *
   * * Client xy
   * * Screen xy
   */
  fxy?: [number, number, number, number];

  /**
   * Client xy
   * */
  xy?: [number, number];

  /** Count */
  n: number;
  /** Duration */
  d: number;
  /** Last event timestamp */
  ts: number;
};

/**
 * @internal
 */
export type BehaviorSignal<MetricVectorType = OnlineMetricStateVector> = {
  onoff: {
    /** Key down - key up */
    kdu: MetricVectorType;
    /** Mouse down - mouse up */
    mdu: MetricVectorType;
    /** Touch start - touch end */
    tse: MetricVectorType;
    /** Scroll - scroll end */
    se: MetricVectorType;
    /** Scroll end - mouse down */
    semd: MetricVectorType;
    /** Mouse enter - mouse down */
    med: MetricVectorType;
    /** Mouse leave - mouse enter */
    mle: MetricVectorType;
    /** Composition start - composition end */
    cse: MetricVectorType;
    /** Pointer down - pointer cancel */
    pdc: MetricVectorType;
    /** Mouse move - click */
    mmc: MetricVectorType;
    /** Focus in - key down */
    fikd: MetricVectorType;
  };

  /** Movement signals */
  mov: {
    /** Time duration */
    t: MetricVectorType;
    /** Velocity */
    v: MetricVectorType;
    /** Distance */
    d: MetricVectorType;
    /** Count of singular movements */
    ns: number;
  };

  /** Device Orientation signals */
  do: DeviceOrientation;

  /** Device Motion signals */
  dm: DeviceMotion<MetricVectorType>;

  /**
   * Event counts
   * * Mouse out
   * * Pointer cancel
   * * Focus, Focus in,
   * * blur, visibilitychange
   * * Copy, paste, cut
   * * contextmenu
   * * click, auxclick
   * * wheel
   * * resize
   */
  nev: [
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
  ];
  /**
   * Key counts
   * * F-keys
   * * Backspace and delete
   * * Tab
   * * Insert
   * * Control
   * * Enter
   * * Arrow keys
   * * Page up/down
   */
  nk: [number, number, number, number, number, number, number, number];
};

/**
 * @internal
 */
export type DeviceMotion<MetricVectorType = OnlineMetricStateVector> = {
  /** Count */
  n: number;

  /** Acceleration */
  ac: MetricVectorType;

  /** Rotation rate */
  rr: MetricVectorType;

  /** Including gravity */
  g: boolean;

  /** Interval */
  i: number;

  /** Timestamp */
  ts: number;
};

/**
 * @internal
 */
export type DeviceOrientation<MetricVectorType = OnlineMetricStateVector> = {
  /** Alpha */
  a?: number;
  /** Beta */
  b?: number;
  /** Gamma */
  g?: number;

  /** Beta deltas */
  bd: MetricVectorType;
  /** Gamma deltas */
  gd: MetricVectorType;

  /** Timestamp */
  ts: number;

  /** First timestamp */
  fts: number;
};

/**
 * @internal
 */
export type TouchMoveSignal = {
  /** Touch identifier */
  id: number;

  /** Number of touches */
  n: number;

  /**
   * * Client xy
   * * Screen xy
   * * Page xy
   */
  xy: [number, number, number, number, number, number];
  /**
   * * radius xy (float)
   * * rotation angle (float)
   * * force (float)
   */
  r: [number, number, number, number];
  /**
   * Radius change count
   */
  rn: number;

  /** Timestamp */
  ts: number;
};

/**
 * @internal
 */
export type DimensionsSignal = {
  /**
   * * Window inner width height
   * * Window outer width height
   * * Window screen xy
   * * Window page offset xy
   * * Body client width height
   * */
  d: [number, number, number, number, number, number, number, number, number, number];

  /** Window device pixel ratio */
  dpr: number;
};
