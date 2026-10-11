import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { FIELD_CX, FIELD_CY } from "./constants";
import { game } from "./game";

function setup() {
  const canvas = createCanvas(1280, 720);
  const target = new EventTarget();
  const engine = createEngine({
    canvas: canvas as unknown as HTMLCanvasElement,
    width: 1280,
    height: 720,
    game,
    layout: "dual-vertical",
    clock: new ConstantClock(10),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => target,
    },
  });
  return engine;
}

describe("Carom simulation", () => {
  it("initializes the complete title state and debug world", async () => {
    const engine = setup();
    await engine.initialize();
    const state = engine.debug.snapshot(engine.state);
    expect(state.screen).toBe("title");
    expect(state.ball).toMatchObject({ x: FIELD_CX, y: FIELD_CY, held: true });
    expect(state.obstacles).toHaveLength(2);
    expect(engine.debug.menuItemRect(engine.state, 1)).not.toBeNull();
    engine.destroy();
  });

  it("serves after elapsed hold time and advances the ball", async () => {
    const engine = setup();
    await engine.initialize();
    engine.apply((s) => engine.debug.setScreen(s, "countdown"));
    await engine.advance(101);
    const ball = engine.debug.snapshot(engine.state).ball;
    expect(engine.state.screen).toBe("playing");
    expect(ball?.held).toBe(false);
    expect(ball?.speed).toBeCloseTo(520, 4);
    expect(ball?.x).not.toBe(FIELD_CX);
    engine.destroy();
  });

  it("steps real collisions and respects reset and empty-world poses", async () => {
    const engine = setup();
    await engine.initialize();
    engine.apply((s) => engine.debug.clearWorld(s));
    expect(engine.debug.snapshot(engine.state).ball).toBeNull();
    engine.apply((s) => engine.debug.spawnBall(s));
    engine.apply((s) => engine.debug.setPaddleDriven(s, "left", true));
    engine.apply((s) => engine.debug.setPaddleVy(s, "left", 100));
    engine.apply((s) => engine.debug.setScreen(s, "playing"));
    engine.apply((s) => engine.debug.setBallHeld(s, false));
    engine.apply((s) => engine.debug.setBallPosition(s, 80, FIELD_CY));
    engine.apply((s) => engine.debug.setBallVelocity(s, -500, 0));
    await engine.advance(3);
    expect(engine.debug.snapshot(engine.state).ball?.vx).toBeGreaterThan(0);
    expect(engine.debug.snapshot(engine.state).paddles.left.cy).toBeGreaterThan(
      FIELD_CY,
    );
    engine.apply((s) => engine.debug.reset(s));
    expect(engine.state.screen).toBe("title");
    expect(engine.state.paddles.left.driven).toBe(false);
    engine.destroy();
  });
});
