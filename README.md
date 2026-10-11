# Carom

Carom is a top-down paddle duel built around spin and bank shots. Return the ball past your opponent to score, and use paddle motion to bend its flight around the two central obstacles. Play solo against the AI or share the keyboard in local Versus.

## Install and run

```sh
npm ci
npm run dev
```

Vite prints the local development URL. To create the self-contained static production site, run `npm run build`; the finished site is in `dist/` and can be served from any static host.

## Controls

- **Solo:** `W` / `S` moves your left paddle. The arrow keys also control that paddle.
- **Versus:** `W` / `S` controls the left paddle; `↑` / `↓` controls the right paddle.
- **Menus:** arrow keys or `W` / `S` to navigate, `Enter` or `Space` to confirm.
- **Pause / resume:** `P` or `Escape`.
- **Sound:** `M` toggles sound.

The game also supports pointer and touch selection in menus. The engine supplies touch controls for play.
