# Lil8TD Demo Script — "Tiny Tower Duel" vs AI

Status: playable demo (ruleset `0.2.0`). This script is the 5–8 minute walkthrough for showing
Lil8TD to someone new, plus the checks to run before a demo.

## What the demo proves

- A complete match loop in the browser: title → how-to-play → 10-wave match → result → rematch.
- The locked MVP model (`MVP_SCOPE_DECISIONS.md`): **mirrored dual-board PvP**, **survival-collapse**,
  **one pressure mechanic** (send an extra raider pack after a visible windup).
- An AI opponent that plays by the same rules (`BOT_AI_PLAN_V0.md`): no hidden income, no
  cooldown bypasses, only ordinary commands. Three difficulty profiles.
- A deterministic 20 Hz simulation: the same seed + command stream replays to the same hash.
- The Sprite Set V2 direction (*Cozy RTS Miniatures + Dandadan Accents*): warm moss/road base,
  hero tower silhouettes, crimson/teal accents reserved for supernatural/pressure moments.

## Before the demo (2 minutes)

```bash
npm test          # deterministic sim, pressure, result-rule and bot tests
npm run build     # static/module sanity check
npm run smoke     # solo + bot-vs-bot ladder table, 0 rejected commands expected
npm start         # http://localhost:4173
```

Use a desktop browser at ≥1280 px wide for the main demo; the layout also works on a phone
(portrait, single column) if you want to show that.
Sound is synthesized with WebAudio and starts after the first click; `M` toggles it.

## Walkthrough

### 1. Title screen (30 s)
- The board behind the menu is an **attract-mode bot-vs-bot match** (Normal vs Hard) running on the
  real simulation — point at the opponent mini-board on the right updating live.
- Pick a difficulty. Read the personality line: Easy *Stable Defender*, Normal *Tempo Aggressor*,
  Hard *Greedy Scaler*. Recommend **Normal** for a first showing.
- Optional: open **How to play** — the tower/raider roster is generated from `content/ruleset.v0.json`.

### 2. Opening (≈1 min, waves 1–2)
- Click **Battle vs AI**. 10 s of prep before *Baseline Stream*.
- Press `1` (Arrow) and place two Arrows on the inside of the first bend, e.g. tiles (2,2) and (4,2).
  Hover shows a green/red tile and the range ring before you commit.
- Point out the HUD: wave counter + template name, next-wave timer, ♥ lives, ◆ credits, AI ♥.
- The strip under the board previews the **next wave's composition** (icons × counts).
- Watch the mini-board: the AI's intent line reads things like `build arrow`, `save for piercer`,
  `banking for Runner Rush` — it is choosing actions the same way a player would.

### 3. Roles and upgrades (≈2 min, waves 3–5)
- Wave 3 is a **Swarm Clump** (swarmlings): press `2` and drop a **Burst** near a bend; show splash.
- Wave 4 brings **Brutes**: press `4` for a **Piercer** — it focuses the toughest target and cracks
  shields at double rate (wave 5 introduces **Shield Bearers** with a second, pale shield bar).
- Click an Arrow → range ring, stats, next-level preview; press `U` to upgrade (gold pips = level).
- Optional: `3` **Frost** at the start of the lane to slow everything, `5` **Beacon** next to a cluster —
  the teal glow + teal pip shows exactly which towers get the +25% damage.

### 4. Pressure, both ways (≈2 min, waves 2–8)
- Send raiders with the crimson buttons (`Z` squad from wave 2, `X` runner rush from wave 4, `C` brutes from wave 6).
  The pack appears on the AI board after a 6–8 s windup; time it so it lands **just after their next
  wave starts** (the next-wave timer helps).
- When the AI sends at you: a red **Incoming** alert + countdown bar appears and a chime plays.
  Those raiders spawn from the rift with a **crimson ring** under them. Explain that the windup is
  the counterplay window: build or upgrade before it lands.
- Use `F` to cycle 1x/2x/3x speed between interesting moments; `Space` pauses (you can still build
  while paused).

### 5. Finale and result (≈1–2 min, waves 8–10)
- *Cleanup Tail* mixes everything; wave 10 is the **Moss Warlord** boss (shield + 10-life leak).
- A keep that hits 0 lives shows **COLLAPSED**; the other side wins immediately. If both survive all
  10 waves, more lives wins (equal lives = draw).
- The result screen compares both sides: lives, raiders defeated, leaks, towers, upgrades, packs sent,
  credits earned, match time. **Rematch** reseeds; **Main menu** returns to the attract match.

## Talking points

- **Determinism**: integer-only sim, stable command ordering (slot, priority, sequence), no
  `Math.random` in the sim, bots seeded per match. `test/bot.test.js` replays a bot-vs-bot match twice
  and compares state hashes; this is the base for future lockstep/MultiWebCore online play.
- **Fair AI**: bots rank "build X on its best tile" and "upgrade T" by damage-per-credit scaled by what
  the next waves ask for (swarm → splash, heavy/shield → piercer, fast → arrows/slow), keep recovery
  discipline after leaks, and bank credits for a send timed into your wave. Over 30 seeds Hard beats
  Easy ~78% and Normal ~62% head-to-head (`node scripts/run-smoke.mjs`).
- **Data-driven content**: all numbers live in `scripts/generate-ruleset.mjs` → `content/ruleset.v0.json`.
  Waves are authored from the template grammar names (Baseline Stream, Fast Probe, Swarm Clump,
  Heavy Anchor, Bait-and-Punch, Pressure Window, Cleanup Tail, Warlord).
- **Art**: one hand-authored atlas generated by `scripts/generate-handdrawn-art.py` (no external
  assets); road straights/corners are chosen per tile from lane connectivity.

## Known limits (be upfront)

- Single map, single lane; no online 1v1 yet (MultiWebCore integration is the next milestone).
- Balance is a first pass tuned with bot-vs-bot runs; solo Practice is intentionally forgiving.
- Loadouts from `DESIGN_FOUNDATION_LOADOUTS.md` are still data only (not selectable).
- No persistent progression, no replays UI (the hash/replay foundation exists in tests).
