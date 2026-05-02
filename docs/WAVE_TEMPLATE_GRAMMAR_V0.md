# Lil8TD Wave Template Grammar V0

## Purpose

This document defines the first wave-template grammar for Lil8TD.

The goal is to make waves varied, readable, and deterministic-friendly without expanding the MVP into a larger design. Templates are a content-authoring language: they describe the **shape** of a wave before it is compiled into explicit spawn groups for the simulation.

Use this document with:
- `docs/SIMULATION_CONTRACT.md`
- `docs/PRESSURE_MECHANIC_V0.md`
- `docs/GAMEPLAY_VARIETY_RANDOMNESS_PASS_V0.md`
- `content/ruleset.v0.json`

## Core rule: waves vary by question, not just count

A wave should not only ask “can the player kill N enemies?”

Good waves vary by:
- **shape** — stream, clump, anchor, tail, layered packet
- **cadence** — steady, bursty, staggered, delayed
- **layering** — fast before heavy, heavy before cleanup, support inside escort
- **timing question** — where tower cooldowns, coverage, pressure sends, or upgrades are stressed
- **recovery space** — when the player gets a readable breath before the next check

Bad wave variety is mostly:
- +20% enemy count
- hidden stat multipliers
- random spawn noise
- too many roles at once
- long waves that differ only by duration

The player should be able to preview a wave and understand its main question.

## Template vocabulary

Each template should define:

```text
templateId
primary gameplay question
typical enemy roles
pacing feel
defense weaknesses tested
fairness/readability guardrails
allowed seeded variants
```

The runtime simulation does not need to understand templates in V0. Templates can compile into normal deterministic `waves[].groups[]` data.

---

# Base templates

## 1. Baseline Stream

**Gameplay question**
- Is the defense’s baseline DPS/range economy healthy?
- Does the board kill ordinary enemies before the danger zone?

**Typical enemy roles**
- Grunt / baseline unit
- Optional tiny Runner tail after the teaching phase

**Pacing feel**
- Steady, readable, low drama.
- Feels like the game’s calibration pulse.

**Weaknesses tested**
- Underbuilt early defense
- Bad range coverage
- Greedy economy that skips required baseline DPS

**Avoid**
- Making it long just to inflate difficulty.
- Hiding special units inside the first teaching stream.
- Using tight spacing that accidentally turns it into a Swarm Clump.

## 2. Fast Probe

**Gameplay question**
- Can the defense catch fast leaks?
- Is coverage deep enough, or is the board only strong at one kill point?

**Typical enemy roles**
- Runner / fast-light unit
- Optional Grunt screen before or after, but not enough to hide the probe

**Pacing feel**
- Sharp, quick, nervous.
- A small “are you awake?” check rather than a full damage wall.

**Weaknesses tested**
- Short range
- Poor early-path coverage
- Slow tower turn/cooldown timing
- Overinvestment into anti-heavy only

**Avoid**
- Surprise lethal fast packs with no preview.
- Fast units stacked behind high-HP anchors before target priority is readable.
- Making Frost mandatory; good placement and enough baseline damage should also work.

## 3. Heavy Anchor

**Gameplay question**
- Can the defense commit sustained damage into high-HP targets while other bodies are present?

**Typical enemy roles**
- Brute / heavy unit
- Grunt stream or light escort
- Later: shielded unit if shield rules are clearly taught

**Pacing feel**
- Slow pressure, visible dread.
- The player sees the problem coming and must decide whether to upgrade, build, or accept risk.

**Weaknesses tested**
- Low single-target damage
- Overreliance on splash
- Poor focus-fire efficiency
- Greedy pressure spending before stabilizing defense

**Avoid**
- Pure sponge waves with no shape.
- Too many Brutes at once early.
- Combining heavy anchors with fast tails and support aura in the same first-use wave.

## 4. Swarm Clump

**Gameplay question**
- Can the defense handle body-count density and avoid overkill waste?

**Typical enemy roles**
- Swarmling / very light swarm unit when available
- Grunt clumps as V0 fallback
- Optional small cleanup bodies

**Pacing feel**
- Compact burst, satisfying if the player has splash.
- Should feel busy but still countable.

**Weaknesses tested**
- Pure single-target builds
- Bad splash placement
- Targeting that wastes shots on already-doomed enemies
- Lack of cleanup coverage

**Avoid**
- Full-screen pixel soup.
- Huge counts with tiny spacing if silhouettes merge.
- Swarms mixed with multiple special traits before the visual language is proven.

## 5. Bait-and-Punch

**Gameplay question**
- Can the defense survive a second layer after spending cooldowns/targeting attention on the first layer?

**Typical enemy roles**
- Bait: Grunt trickle, small swarm, or light shield pair
- Punch: Runner packet, Brute anchor, or denser Grunt pack

**Pacing feel**
- Two-beat rhythm: “small ask” then “real ask.”
- Creates planning tension without being an ambush.

**Weaknesses tested**
- Single kill-zone dependence
- Long tower cooldowns with no coverage overlap
- Poor upgrade timing
- Bad pressure-send timing that leaves own board underdefended

**Avoid**
- Hiding the punch from preview.
- Making the bait itself lethal.
- Using more than two meaningful layers in MVP.

## 6. Cleanup Tail

**Gameplay question**
- Does the defense still work after the main group passes through the kill zone?

**Typical enemy roles**
- Small Runner tail
- Small Grunt/Swarmling tail
- Rarely a late Brute unless the wave is explicitly heavy-focused

**Pacing feel**
- Late sting.
- The player relaxes, then must prove the board has depth.

**Weaknesses tested**
- Front-loaded tower placement
- Slow recovery after cooldown-heavy burst
- No second coverage point near the exit
- Overfocus on the wave’s first visible threat

**Avoid**
- Tails so late they feel like a separate hidden wave.
- Lethal tails after already brutal main bodies.
- Repeating cleanup tails every wave; they stop being interesting fast.

## 7. Support Escort

**Gameplay question**
- Can the defense identify and remove a high-value support target inside a readable group?

**Typical enemy roles**
- Support Carrier / aura unit
- Moderate Grunt escort
- Optional single Brute escort later, after support is understood

**Pacing feel**
- Tactical and focused.
- Less about raw count, more about priority and clarity.

**Weaknesses tested**
- No target-priority tools/placement
- Low burst against key targets
- Overreliance on generic stream handling
- Poor readability of support effects

**Avoid**
- First-use support plus shield plus fast tail.
- Hidden aura rules.
- Support effects that are visually subtle but numerically decisive.
- Escort sizes that bury the support sprite.

## 8. Pressure Window Wave

**Gameplay question**
- Can the player defend a fair, visible overlap opportunity in PvP?
- Can the opponent time pressure without turning the board into unreadable chaos?

**Typical enemy roles**
- Moderate base wave: Grunts/Runners/one Brute depending on phase
- Clear gap or stress point where a pressure pack can overlap
- Pressure pack remains data-defined by `PRESSURE_MECHANIC_V0.md`

**Pacing feel**
- Competitive tension.
- The base wave is not maximal by itself; the drama comes from the timing window.

**Weaknesses tested**
- Greedy economy during known danger windows
- Poor response to incoming pressure windup
- Defenses that barely solve normal waves with no buffer
- Bad pressure timing by the sender

**Avoid**
- Designing base wave + optimal pressure as guaranteed leak.
- Multiple overlapping pressure windows inside one short wave.
- Pressure enemies that visually blend into base-wave enemies.
- Stackups where the answer is impossible to read even if the player has resources.

---

# Deterministic-friendly variation

## Authored templates + seeded variants

Variation should be selected from **authored variant pools**, not generated freely during combat.

Recommended flow:

```text
matchSeed + rulesetVersion + waveIndex
  -> choose authored variant id
  -> expand into explicit spawn groups before match start
  -> both mirrored boards use the same base wave variant
  -> replay stores seed and/or expanded wave schedule
```

This preserves:
- deterministic simulation
- PvP fairness
- replay/debuggability
- readable wave previews

## What can vary

Within tight balance bands:
- enemy group offset timing
- stream spacing / interval
- whether an anchor appears early, mid, or late
- small count differences if total threat budget stays equivalent
- cleanup tail timing
- which authored pressure window is active
- cosmetic labels/preview ordering, if non-gameplay

Good variant examples:
- Heavy Anchor A: Brute early, wider Grunt stream
- Heavy Anchor B: Brute mid, tighter Grunt stream
- Fast Probe A: Runner probe before main stream
- Fast Probe B: Runner probe after main stream

## What cannot vary

For MVP competitive modes, do not vary:
- enemy stats after match start
- hidden enemy traits
- path/lane layout
- tower targeting rules
- spawn RNG during active combat
- adaptive “director” counters to the player’s current build
- pressure pack contents without explicit preview
- base-wave variant independently per PvP player

## Mirrored PvP rule

In mirrored dual-board PvP:
- both players receive the same base wave variant
- player-sent pressure is asymmetric by choice and timing only
- the selected base-wave variant must be visible/derivable for both clients
- server/host authority should compare commands against the same expanded wave schedule

Fairness comes from mirrored base pressure plus player decisions, not different PvE rolls.

---

# Relation to the pressure system

Pressure works best when base waves create **readable opportunity**, not accidental clutter.

## Templates that create strong pressure windows

Best pressure-window partners:
- **Heavy Anchor** — pressure during Brute soak tests sustained damage and target load.
- **Bait-and-Punch** — pressure can arrive between beats or on the punch beat.
- **Cleanup Tail** — pressure before/after the tail tests coverage depth.
- **Fast Probe** — pressure can punish thin coverage, but must stay small.
- **Pressure Window Wave** — explicit authored PvP timing check.

Less ideal as primary overlap:
- **Swarm Clump** if it already fills the screen.
- **Support Escort** during first support teaching waves.
- **Baseline Stream** unless the goal is gentle pressure onboarding.

## Guardrails against pressure mud

- Do not tune normal waves assuming constant pressure sends.
- Do not make optimal pressure always overlap the densest visual moment.
- Prefer one clear overlap question per wave.
- Keep pressure packs smaller than the base wave’s main body.
- Use windup UI and wave preview together: the defender should know both threats.
- If overlap feels unfair, reduce count/spacing first before adding counter-mechanics.

Pressure should make the player think “bad timing for me,” not “the game became unreadable.”

---

# Practical authoring guidance

## Building a wave progression

A compact progression can be assembled like this:

```text
1. Baseline Stream       — teach normal defense
2. Fast Probe            — teach coverage
3. Baseline Stream+tail  — reinforce depth
4. Heavy Anchor          — teach anti-heavy
5. Swarm Clump           — teach splash
6. Bait-and-Punch        — test cooldown/placement rhythm
7. Pressure Window Wave  — PvP timing opportunity
8. Support Escort        — introduce priority, if support exists
```

Rules of thumb:
- one main question per wave
- one new enemy role at a time
- one harsh wave should be followed by a more readable or economically useful wave
- rotate template families, not only enemy counts
- mark pressure-window waves intentionally in data/docs

## Avoiding repetitive pattern spam

Do not repeat:
- Runner tails every wave
- Brute-in-Grunt streams as the only midgame pattern
- endless dense clumps to justify Burst
- pressure windows that always occur at the same offset

Use alternation:
- stream -> probe -> anchor -> recovery
- clump -> cleanup -> anchor -> pressure window
- support teaching -> baseline relief -> support mixed later

If two waves share enemies, change the shape. If two waves share shape, change the enemy question.

## Introducing new enemy roles

When adding a new enemy role:

1. First appearance uses a simple template.
2. The wave’s main question is the new role.
3. No second new special trait in the same wave.
4. Preview and sprite language must explain the role.
5. Only after one or two readable uses can the role appear in mixed templates.

Examples:
- Shielded unit first appears in a Baseline Stream or simple Heavy Anchor.
- Support Carrier first appears in Support Escort with a small escort.
- Swarmling first appears in Swarm Clump without fast tails.

New roles should extend the wave language, not replace it with exceptions.

## Data shape recommendation

A future ruleset can keep authored grammar next to compiled waves:

```json
{
  "waveTemplates": [
    {
      "templateId": "heavy_anchor",
      "readabilityTier": 2,
      "rolesTested": ["anti_heavy", "targeting_under_stream"],
      "variants": [
        {
          "variantId": "early_anchor",
          "threatBudgetBand": "equivalent",
          "groups": []
        }
      ]
    }
  ],
  "waves": [
    {
      "waveIndex": 4,
      "templateId": "heavy_anchor",
      "selectedVariantId": "early_anchor",
      "groups": []
    }
  ]
}
```

The compiled `groups[]` remain the authoritative simulation input.

## V0 lock

For MVP V0:
- templates are design/content concepts
- expanded wave groups are authoritative
- seeded variants must be previewable
- mirrored PvP boards share base-wave variants
- pressure overlap is intentional, small, and readable
