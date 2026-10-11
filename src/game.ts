import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  LAYOUT,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  MATCHOVER_ITEMS,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_HH,
  OBSTACLE_W,
  OBSTACLES,
  PAUSE_ITEMS,
  PADDLE_HALF,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface CaromSnapshot extends Omit<CaromState, "ball"> {
  readonly version: number;
  readonly ball: (BallState & { readonly speed: number }) | null;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}

export const BACKGROUND = "#07111d";
const INK = "#eaf7ff";
const CYAN = "#39e6d0";
const CORAL = "#ff657a";
const GOLD = "#ffc96b";
const menuRects = (screen: Screen) => {
  const items =
    screen === "title"
      ? TITLE_ITEMS
      : screen === "paused"
        ? PAUSE_ITEMS
        : screen === "matchover"
          ? MATCHOVER_ITEMS
          : screen === "howto"
            ? ["BACK"]
            : [];
  const y0 = screen === "title" ? 370 : screen === "matchover" ? 450 : 390;
  return items.map((_, i) => ({ x: 430, y: y0 + i * 64 - 22, w: 420, h: 48 }));
};
const sign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const makeBall = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: sign(),
  trail: [],
});
const paddle = (): PaddleState => ({
  cy: FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const homeState = (muted: boolean, titleIndex = 0): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: titleIndex,
  titleIndex,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: paddle(), right: paddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: makeBall(),
  obstacles: OBSTACLE_CENTERS.map((c, index) => ({ index, cx: c.x, cy: c.y })),
  simTime: 0,
  muted,
});
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const copy = (s: DeepReadonly<CaromState>): CaromState => ({
  ...s,
  score: { ...s.score },
  paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
  ai: { ...s.ai },
  obstacles: [...s.obstacles],
  ball: s.ball ? { ...s.ball, trail: [...s.ball.trail] } : null,
});
const ballOrThrow = (s: DeepReadonly<CaromState>): BallState => {
  if (!s.ball) throw new Error("Carom: no ball is present");
  return { ...s.ball, trail: [...s.ball.trail] };
};
const park = (b: BallState): BallState => ({
  ...b,
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: sign(),
  trail: [],
});

function createDebug(): CaromDebugApi {
  const patchSide = (
    s: DeepReadonly<CaromState>,
    side: Side,
    fn: (p: PaddleState) => PaddleState,
  ): CaromState => {
    const n = copy(s);
    return { ...n, paddles: { ...n.paddles, [side]: fn(n.paddles[side]) } };
  };
  const needBall = (
    s: DeepReadonly<CaromState>,
    fn: (b: BallState) => BallState,
  ): CaromState => {
    const n = copy(s);
    return { ...n, ball: fn(ballOrThrow(s)) };
  };
  return {
    version: CAROM_DEBUG_VERSION,
    clearWorld: (s) => ({ ...copy(s), ball: null, obstacles: [] }),
    spawnBall: (s) => ({ ...copy(s), ball: makeBall() }),
    spawnObstacle: (s, index) => {
      const c = OBSTACLE_CENTERS[index];
      if (!c) throw new Error(`Carom: invalid obstacle index ${index}`);
      const n = copy(s);
      return {
        ...n,
        obstacles: [
          ...n.obstacles.filter((o) => o.index !== index),
          { index, cx: c.x, cy: c.y },
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (s) => homeState(s.muted),
    reconcile: (s) => copy(s),
    setScreen: (s, screen) => ({ ...copy(s), screen }),
    setMode: (s, mode) => ({ ...copy(s), mode }),
    setMenuIndex: (s, menuIndex) => ({ ...copy(s), menuIndex }),
    setTitleIndex: (s, titleIndex) => ({ ...copy(s), titleIndex }),
    setResumeScreen: (s, resumeScreen) => ({ ...copy(s), resumeScreen }),
    setScore: (s, p1, p2) => ({ ...copy(s), score: { p1, p2 } }),
    setWinner: (s, winner) => ({ ...copy(s), winner }),
    setReceiver: (s, receiver) => ({ ...copy(s), receiver }),
    setPaddleCy: (s, side, cy) => patchSide(s, side, (p) => ({ ...p, cy })),
    setPaddleVy: (s, side, drivenVy) =>
      patchSide(s, side, (p) => ({ ...p, drivenVy })),
    setPaddleDriven: (s, side, driven) =>
      patchSide(s, side, (p) => ({ ...p, driven })),
    setBallPosition: (s, x, y) => needBall(s, (b) => ({ ...b, x, y })),
    setBallVelocity: (s, vx, vy) => needBall(s, (b) => ({ ...b, vx, vy })),
    setBallSpin: (s, spin) => needBall(s, (b) => ({ ...b, spin })),
    setBallHeld: (s, held) => needBall(s, (b) => ({ ...b, held })),
    setBallHoldTimer: (s, holdTimer) =>
      needBall(s, (b) => ({
        ...b,
        holdTimer,
        held: holdTimer <= 0 ? false : b.held,
      })),
    setBallServeSign: (s, serveSign) =>
      needBall(s, (b) => ({ ...b, serveSign })),
    drawBallServeSign: (s) => needBall(s, (b) => ({ ...b, serveSign: sign() })),
    setAiTracking: (s, tracking) => ({ ...copy(s), ai: { ...s.ai, tracking } }),
    setAiMovement: (s, movement) => ({ ...copy(s), ai: { ...s.ai, movement } }),
    setMuted: (s, muted) => ({ ...copy(s), muted }),
    snapshot: (s) => ({
      ...copy(s),
      version: CAROM_DEBUG_VERSION,
      ball: s.ball
        ? {
            ...s.ball,
            trail: [...s.ball.trail],
            speed: Math.hypot(s.ball.vx, s.ball.vy),
          }
        : null,
    }),
    menuItemRect: (s, index) => menuRects(s.screen)[index] ?? null,
  };
}

function startMatch(s: CaromState, mode = s.mode): CaromState {
  return {
    ...s,
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: makeBall(),
    paddles: { left: paddle(), right: paddle() },
  };
}
function returnTitle(s: CaromState): CaromState {
  const n = homeState(s.muted, s.titleIndex);
  return {
    ...n,
    titleIndex: s.titleIndex,
    menuIndex: s.titleIndex,
    simTime: s.simTime,
  };
}
function choose(s: CaromState): CaromState {
  if (s.screen === "title") {
    const titleIndex = s.menuIndex;
    if (titleIndex < 2)
      return {
        ...startMatch(s, titleIndex === 0 ? "solo" : "versus"),
        titleIndex,
      };
    return { ...s, screen: "howto", menuIndex: 0, titleIndex };
  }
  if (s.screen === "howto") return returnTitle(s);
  if (s.screen === "paused")
    return s.menuIndex === 0
      ? { ...s, screen: s.resumeScreen }
      : s.menuIndex === 1
        ? startMatch(s)
        : returnTitle(s);
  if (s.screen === "matchover")
    return s.menuIndex === 0 ? startMatch(s) : returnTitle(s);
  return s;
}
function inputFrame(s0: CaromState, api: UpdateApi): CaromState {
  let s = s0;
  if (api.input.pressed("mute")) {
    const muted = !api.audio.muted();
    api.audio.setMuted(muted);
    s = { ...s, muted };
  }
  const edges = Object.fromEntries(
    ACTIONS.map((a) => [a, api.input.pressed(a)]),
  ) as Record<(typeof ACTIONS)[number], boolean>;
  const max =
    s.screen === "title"
      ? TITLE_ITEMS.length
      : s.screen === "paused"
        ? PAUSE_ITEMS.length
        : s.screen === "matchover"
          ? MATCHOVER_ITEMS.length
          : s.screen === "howto"
            ? 1
            : 0;
  const up = edges["p1-up"] || edges["p2-up"],
    down = edges["p1-down"] || edges["p2-down"];
  if ((s.screen === "countdown" || s.screen === "playing") && edges.pause)
    s = { ...s, resumeScreen: s.screen, screen: "paused", menuIndex: 0 };
  else if (s.screen === "paused" && (edges.pause || edges.back))
    s = { ...s, screen: s.resumeScreen };
  else if (max && (up || down))
    s = { ...s, menuIndex: (s.menuIndex + (up ? max - 1 : 1)) % max };
  else if (
    (s.screen === "title" ||
      s.screen === "howto" ||
      s.screen === "paused" ||
      s.screen === "matchover") &&
    edges.back
  )
    s = s.screen === "howto" || s.screen === "matchover" ? returnTitle(s) : s;
  else if (max && edges.confirm) s = choose(s);
  if (max) {
    const rects = menuRects(s.screen),
      samples = api.input.pointerSamples().filter((p) => p.primary);
    const pointer = api.input.pointer();
    const hit = (x: number, y: number) =>
      rects.findIndex(
        (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h,
      );
    if (!samples.length) {
      const i = hit(pointer.x, pointer.y);
      if (i >= 0) s = { ...s, menuIndex: i };
    } else {
      const selectedAtFrameStart = s.menuIndex;
      let downIndex = -1;
      for (const sample of samples) {
        const i = hit(sample.x, sample.y);
        if (i >= 0) s = { ...s, menuIndex: i };
        if (sample.type === "down") downIndex = i;
        if (sample.type === "up") {
          if (i >= 0) s = { ...s, menuIndex: i };
          if (
            (downIndex >= 0 ? i === downIndex : i === selectedAtFrameStart) &&
            i >= 0
          )
            s = choose(s);
          downIndex = -1;
        }
      }
    }
  }
  return s;
}
function movePaddle(p: PaddleState, vy: number, dt: number): PaddleState {
  const cy = clamp(p.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  if (cy !== p.cy && dt > 0) vy = (cy - p.cy) / dt;
  return { ...p, cy, vy };
}
function movePaddles(s: CaromState, api: UpdateApi, dt: number): CaromState {
  const axis = (up: string, down: string) =>
    api.input.value(down) - api.input.value(up);
  const lp = s.paddles.left;
  const lv = lp.driven
    ? lp.drivenVy
    : (s.mode === "solo"
        ? axis("p1-up", "p1-down") + axis("p2-up", "p2-down")
        : axis("p1-up", "p1-down")) * PADDLE_SPEED;
  let right = s.paddles.right;
  let rv = 0;
  if (right.driven) rv = right.drivenVy;
  else if (s.mode === "versus") rv = axis("p2-up", "p2-down") * PADDLE_SPEED;
  else if (s.ai.movement) {
    let target = AI_HOME_Y,
      deadzone = AI_HOME_DEADZONE;
    if (s.ai.tracking && s.screen === "playing" && s.ball && s.ball.vx > 0) {
      target = s.ball.y - s.ball.vy * AI_REACT;
      deadzone = AI_DEADZONE;
    }
    const diff = target - right.cy;
    rv =
      Math.abs(diff) <= deadzone || dt <= 0
        ? 0
        : Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
  }
  if (!s.ai.movement && !right.driven && s.mode === "solo") rv = 0;
  right = movePaddle(right, rv, dt);
  return { ...s, paddles: { left: movePaddle(lp, lv, dt), right } };
}
type Event = "paddle" | "wall" | "obstacle";
function resolveRect(
  b: BallState,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { ball: BallState; face: number } | null {
  const l = x0 - BALL_R,
    r = x1 + BALL_R,
    t = y0 - BALL_R,
    bot = y1 + BALL_R;
  if (!(b.x > l && b.x < r && b.y > t && b.y < bot)) return null;
  const depths = [b.x - l, r - b.x, b.y - t, bot - b.y];
  let face = 0;
  for (let i = 1; i < 4; i++) if (depths[i] < depths[face]) face = i;
  let { x, y, vx, vy } = b;
  if (face === 0) {
    x = x0 - BALL_R;
    if (vx > 0) vx = -vx;
  } else if (face === 1) {
    x = x1 + BALL_R;
    if (vx < 0) vx = -vx;
  } else if (face === 2) {
    y = y0 - BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = y1 + BALL_R;
    if (vy < 0) vy = -vy;
  }
  return { ball: { ...b, x, y, vx, vy }, face };
}
function advanceBall(
  b0: BallState,
  s: CaromState,
  dt: number,
): { ball: BallState; events: Event[] } {
  let b: BallState = { ...b0, trail: [...b0.trail] };
  const events: Event[] = [];
  const speed = Math.hypot(b.vx, b.vy),
    n = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP)),
    h = dt / n;
  for (let step = 0; step < n; step++) {
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 0) {
      const a = (b.spin / sp) * h,
        c = Math.cos(a),
        sn = Math.sin(a);
      b = { ...b, vx: b.vx * c - b.vy * sn, vy: b.vx * sn + b.vy * c };
    }
    b = {
      ...b,
      spin: b.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
      x: b.x + b.vx * h,
      y: b.y + b.vy * h,
    };
    if (b.y - BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: BALL_R, vy: -b.vy };
      events.push("wall");
    } else if (b.y + BALL_R > FIELD_H && b.vy > 0) {
      b = { ...b, y: FIELD_H - BALL_R, vy: -b.vy };
      events.push("wall");
    }
    for (const side of ["left", "right"] as const) {
      const p = s.paddles[side],
        x0 = side === "left" ? P1_X0 : P2_X0,
        x1 = side === "left" ? P1_X1 : P2_X1;
      const hit = resolveRect(
        b,
        x0,
        p.cy - PADDLE_HALF,
        x1,
        p.cy + PADDLE_HALF,
      );
      if (!hit) continue;
      b = hit.ball;
      if (hit.face < 2) {
        const offset = clamp((b.y - p.cy) / PADDLE_HALF, -1, 1),
          theta = offset * MAX_BOUNCE_ANGLE,
          v = Math.min(Math.hypot(b.vx, b.vy) * SPEED_MULT, SPEED_CAP),
          dir = side === "left" ? 1 : -1;
        b = {
          ...b,
          x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
          vx: dir * v * Math.cos(theta),
          vy: v * Math.sin(theta),
          spin: clamp(
            b.spin + p.vy * SPIN_FROM_PADDLE,
            -SPIN_CLAMP,
            SPIN_CLAMP,
          ),
        };
        events.push("paddle");
      } else events.push("wall");
    }
    for (const o of s.obstacles) {
      const r = OBSTACLES[o.index];
      if (!r) continue;
      const hit = resolveRect(b, r.x0, r.y0, r.x1, r.y1);
      if (hit) {
        b = hit.ball;
        events.push("obstacle");
      }
    }
  }
  return { ball: b, events };
}
function advance(s0: CaromState, dt: number, api: UpdateApi): CaromState {
  let s = movePaddles(s0, api, dt);
  let b = s.ball;
  if (s.screen === "countdown" && b) {
    const timer = b.holdTimer - dt;
    if (timer <= 0) {
      const dir = s.receiver === "left" ? -1 : 1;
      b = {
        ...b,
        held: false,
        holdTimer: 0,
        trail: [],
        vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
        vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
      };
      s = { ...s, screen: "playing" };
    } else b = { ...b, holdTimer: timer };
  } else if (s.screen === "playing" && b && !b.held) {
    const result = advanceBall(b, s, dt);
    b = result.ball;
    for (const e of new Set(result.events))
      api.audio.play(
        e === "paddle"
          ? CUES.paddleHit
          : e === "wall"
            ? CUES.wallBounce
            : CUES.obstacleBounce,
      );
    if (b.x - BALL_R > FIELD_W || b.x + BALL_R < 0) {
      const scorer = b.x > FIELD_CX ? "p1" : "p2",
        next = {
          p1: s.score.p1 + (scorer === "p1" ? 1 : 0),
          p2: s.score.p2 + (scorer === "p2" ? 1 : 0),
        };
      api.audio.play(CUES.score);
      const winner =
        next.p1 >= WIN_SCORE && next.p1 - next.p2 >= WIN_LEAD
          ? "left"
          : next.p2 >= WIN_SCORE && next.p2 - next.p1 >= WIN_LEAD
            ? "right"
            : null;
      s = { ...s, score: next, winner };
      if (winner) {
        s = { ...s, screen: "matchover", menuIndex: 0 };
      } else {
        s = {
          ...s,
          screen: "countdown",
          receiver: scorer === "p1" ? "right" : "left",
        };
        b = park(b);
      }
    }
  }
  if ((s.screen === "countdown" || s.screen === "playing") && b) {
    b = {
      ...b,
      trail: [...b.trail, { x: b.x, y: b.y, t: s.simTime + dt }].filter(
        (sample) => s.simTime + dt - sample.t <= TRAIL_TIME,
      ),
    };
  }
  return { ...s, ball: b, simTime: s.simTime + dt, muted: api.audio.muted() };
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    if (api.input.layout()?.name !== LAYOUT)
      throw new Error("Carom requires the dual-vertical input layout");
    for (const name of ACTIONS)
      api.input.register(name, { keys: [...BINDINGS[name]] });
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 520,
      freqTo: 300,
      durationMs: 55,
      gain: 0.12,
    });
    api.audio.define(CUES.wallBounce, {
      wave: "triangle",
      freq: 320,
      freqTo: 220,
      durationMs: 65,
      gain: 0.1,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "sine",
      freq: 700,
      freqTo: 420,
      durationMs: 70,
      gain: 0.11,
    });
    api.audio.define(CUES.score, {
      wave: "sawtooth",
      freq: 440,
      freqTo: 880,
      durationMs: 180,
      gain: 0.14,
    });
    const diagnostics: [string, (s: DeepReadonly<CaromState>) => string][] = [
      ["screen / mode", (s) => `${s.screen} / ${s.mode}`],
      ["score", (s) => `${s.score.p1} : ${s.score.p2}`],
      [
        "ball pos",
        (s) =>
          s.ball ? `${s.ball.x.toFixed(1)}, ${s.ball.y.toFixed(1)}` : "absent",
      ],
      [
        "ball vel",
        (s) =>
          s.ball
            ? `${s.ball.vx.toFixed(1)}, ${s.ball.vy.toFixed(1)}`
            : "absent",
      ],
      [
        "ball speed / spin",
        (s) =>
          s.ball
            ? `${Math.hypot(s.ball.vx, s.ball.vy).toFixed(1)} / ${s.ball.spin.toFixed(1)}`
            : "absent",
      ],
      [
        "p1 cy / vy",
        (s) =>
          `${s.paddles.left.cy.toFixed(1)} / ${s.paddles.left.vy.toFixed(1)}`,
      ],
      [
        "p2 cy / vy",
        (s) =>
          `${s.paddles.right.cy.toFixed(1)} / ${s.paddles.right.vy.toFixed(1)}`,
      ],
    ];
    for (const [name, source] of diagnostics)
      api.diagnostics.register(name, source);
    const state = homeState(false);
    return [state, createDebug()];
  },
  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    let s = inputFrame(copy(state), api);
    if (s.screen === "countdown" || s.screen === "playing")
      s = advance(s, dt, api);
    else s = { ...s, simTime: s.simTime + dt, muted: api.audio.muted() };
    return s;
  },
  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    draw(state, api);
  },
};

function draw(state: DeepReadonly<CaromState>, api: RenderApi): void {
  const c = api.ctx;
  c.fillStyle = BACKGROUND;
  c.fillRect(0, 0, FIELD_W, FIELD_H);
  c.save();
  c.strokeStyle = "rgba(132,180,208,.11)";
  c.lineWidth = 1;
  for (let x = 0; x <= FIELD_W; x += 80) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, FIELD_H);
    c.stroke();
  }
  for (let y = 0; y <= FIELD_H; y += 80) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(FIELD_W, y);
    c.stroke();
  }
  c.setLineDash([12, 14]);
  c.strokeStyle = "rgba(195,227,241,.32)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(NET_X, 24);
  c.lineTo(NET_X, FIELD_H - 24);
  c.stroke();
  c.setLineDash([]);
  const dim =
    state.screen === "title" ||
    state.screen === "howto" ||
    state.screen === "paused" ||
    state.screen === "matchover";
  c.globalAlpha = dim ? 0.45 : 1;
  for (const o of state.obstacles) {
    c.shadowColor = GOLD;
    c.shadowBlur = 18;
    c.fillStyle = GOLD;
    roundRect(
      c,
      o.cx - OBSTACLE_W / 2,
      o.cy - OBSTACLE_HH,
      OBSTACLE_W,
      OBSTACLE_HH * 2,
      9,
    );
    c.fill();
  }
  const paddles: [Side, number, string][] = [
    ["left", P1_X0, CYAN],
    ["right", P2_X0, CORAL],
  ];
  for (const [side, x, color] of paddles) {
    c.shadowColor = color;
    c.shadowBlur = 20;
    c.fillStyle = color;
    roundRect(
      c,
      x,
      state.paddles[side].cy - PADDLE_H / 2,
      PADDLE_W,
      PADDLE_H,
      8,
    );
    c.fill();
  }
  const b = state.ball;
  if (b) {
    if (!b.held && b.trail.length > 1) {
      c.shadowBlur = 0;
      c.lineCap = "round";
      for (let i = 1; i < b.trail.length; i++) {
        const a = b.trail[i - 1],
          z = b.trail[i];
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(z.x, z.y);
        c.strokeStyle = `rgba(105,235,255,${0.08 + (0.58 * i) / b.trail.length})`;
        c.lineWidth = 2 + (7 * i) / b.trail.length;
        c.stroke();
      }
    }
    c.shadowColor = "#a8f5ff";
    c.shadowBlur = 22;
    c.fillStyle = "#f5ffff";
    c.beginPath();
    c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
  c.shadowBlur = 0;
  if (
    state.screen === "playing" ||
    state.screen === "countdown" ||
    state.screen === "paused" ||
    state.screen === "matchover"
  ) {
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "700 56px system-ui, sans-serif";
    c.fillStyle = "rgba(234,247,255,.94)";
    c.fillText(String(state.score.p1), 560, 72);
    c.fillText(String(state.score.p2), 720, 72);
    c.font = "600 13px system-ui, sans-serif";
    c.fillStyle = "rgba(184,211,227,.72)";
    c.fillText(
      state.mode === "solo" ? "SOLO · FIRST TO 11" : "VERSUS · FIRST TO 11",
      FIELD_CX,
      120,
    );
  }
  if (state.screen === "countdown" && b) {
    c.textAlign = "center";
    c.font = "800 16px system-ui, sans-serif";
    c.fillStyle = INK;
    c.fillText("GET READY", FIELD_CX, 294);
    c.font = "800 30px system-ui, sans-serif";
    c.fillStyle = CYAN;
    c.fillText(String(Math.max(1, Math.ceil(b.holdTimer))), FIELD_CX, 326);
  }
  c.restore();
  if (state.screen === "title") {
    c.save();
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = CYAN;
    c.shadowBlur = 25;
    c.fillStyle = INK;
    c.font = "900 96px system-ui, sans-serif";
    c.fillText(TITLE_TEXT, FIELD_CX, 210);
    c.shadowBlur = 0;
    c.font = "600 15px system-ui, sans-serif";
    c.fillStyle = "#8ca9ba";
    c.fillText("THE BANK SHOT DUEL", FIELD_CX, 279);
    drawMenu(c, state.screen, state.menuIndex);
    c.restore();
  } else if (state.screen === "howto") {
    c.save();
    c.textAlign = "center";
    c.fillStyle = INK;
    c.font = "800 46px system-ui, sans-serif";
    c.fillText("HOW TO PLAY", FIELD_CX, 105);
    c.fillStyle = "#a9c3d2";
    c.font = "500 19px system-ui, sans-serif";
    [
      "W / S moves left paddle · ↑ / ↓ also moves in Solo",
      "Paddle motion adds spin when the ball strikes.",
      "Use the angled obstacles to bank shots around your rival.",
      "First to 11 points, with a 2 point lead, wins.",
    ].forEach((t, i) => c.fillText(t, FIELD_CX, 200 + i * 44));
    drawMenu(c, state.screen, state.menuIndex);
    c.restore();
  } else if (state.screen === "paused") {
    c.save();
    c.fillStyle = "rgba(3,10,17,.72)";
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    c.textAlign = "center";
    c.fillStyle = INK;
    c.font = "900 62px system-ui, sans-serif";
    c.fillText("PAUSED", FIELD_CX, 260);
    drawMenu(c, state.screen, state.menuIndex);
    c.restore();
  } else if (state.screen === "matchover") {
    c.save();
    c.fillStyle = "rgba(3,10,17,.76)";
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    c.textAlign = "center";
    c.fillStyle = GOLD;
    c.font = "900 54px system-ui, sans-serif";
    c.fillText(
      state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS",
      FIELD_CX,
      235,
    );
    c.fillStyle = INK;
    c.font = "700 30px system-ui, sans-serif";
    c.fillText(`${state.score.p1}  —  ${state.score.p2}`, FIELD_CX, 310);
    drawMenu(c, state.screen, state.menuIndex);
    c.restore();
  }
  c.save();
  c.textAlign = "right";
  c.font = "600 12px system-ui, sans-serif";
  c.fillStyle = "rgba(147,177,194,.55)";
  c.fillText(
    state.muted ? "M SOUND OFF" : "M SOUND ON",
    FIELD_W - 28,
    FIELD_H - 24,
  );
  c.restore();
}
function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}
function drawMenu(
  c: CanvasRenderingContext2D,
  screen: Screen,
  selected: number,
): void {
  const items =
    screen === "title"
      ? TITLE_ITEMS
      : screen === "paused"
        ? PAUSE_ITEMS
        : screen === "matchover"
          ? MATCHOVER_ITEMS
          : ["BACK"];
  const rects = menuRects(screen);
  items.forEach((item, i) => {
    const r = rects[i],
      active = i === selected;
    if (active) {
      c.shadowColor = CYAN;
      c.shadowBlur = 18;
      c.fillStyle = "rgba(57,230,208,.13)";
      roundRect(c, r.x, r.y, r.w, r.h, 12);
      c.fill();
      c.strokeStyle = "rgba(57,230,208,.55)";
      c.lineWidth = 1;
      roundRect(c, r.x, r.y, r.w, r.h, 12);
      c.stroke();
    }
    c.shadowBlur = 0;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `${active ? 800 : 600} 18px system-ui, sans-serif`;
    c.fillStyle = active ? INK : "#8ca9ba";
    c.fillText(item, FIELD_CX, r.y + r.h / 2);
  });
}
