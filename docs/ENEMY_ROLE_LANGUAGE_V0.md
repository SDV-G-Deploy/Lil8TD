# Lil8TD Enemy Role Language V0

## Purpose

This document defines the first enemy role language for Lil8TD.

The goal is to let the roster grow without turning enemies into random `hp/speed/reward` variants. Enemy roles should describe the **gameplay question** an enemy asks, the **readable trait** the player sees, and the **wave grammar slot** where that role belongs.

Use this document with:
- `docs/BALANCE_BASELINE_V0.md`
- `docs/GAMEPLAY_VARIETY_RANDOMNESS_PASS_V0.md`
- `docs/WAVE_TEMPLATE_GRAMMAR_V0.md`
- `content/ruleset.v0.json`

## Core rule: enemies vary by question, not stat flavor

HP and speed are tuning tools, not identity.

A good enemy role changes at least one player decision:
- where to place coverage
- whether to buy splash, control, single-target, or sustained damage
- when to upgrade versus build wider
- what to focus first inside a mixed wave
- how much safety buffer to keep for PvP pressure windows

A weak enemy role only says:
- same Grunt but tougher
- same Runner but slightly faster
- same Brute but different color
- hidden resistance table with no board-readable answer

Every enemy should be understandable from preview, silhouette, movement, and wave context before it becomes lethal.

---

# Starter enemy roles

## 1. Baseline / Grunt

**Gameplay question**
- Is the defense’s basic DPS, range, and economy line healthy?
- Can ordinary enemies be killed before the danger zone without special tricks?

**Readable trait identity**
- Neutral body, neutral speed, neutral durability.
- No special effects. It is the calibration enemy.

**Tests these defenses / tower roles**
- Arrow-style baseline single-target DPS.
- General range coverage.
- Early build versus upgrade economy.

**Wave grammar fit**
- Main role in `Baseline Stream`.
- Filler/escort in `Heavy Anchor`, `Support Escort`, and `Pressure Window Wave`.
- Bait layer in `Bait-and-Punch`.

**Avoid**
- Giving Grunts hidden modifiers.
- Letting Grunt-only waves become long sponge checks.
- Using Grunts to mask too many special enemies in early teaching waves.

## 2. Fast leak threat / Runner

**Gameplay question**
- Does the board cover leak gaps and early/late path segments?
- Can the defense handle speed without relying only on one front kill zone?

**Readable trait identity**
- Small/light silhouette, fast constant motion.
- Fragile enough that correct placement visibly solves it.

**Tests these defenses / tower roles**
- Range coverage and path depth.
- Frost/control value without making Frost mandatory.
- Fast target acquisition and cleanup coverage.

**Wave grammar fit**
- Primary role in `Fast Probe`.
- Tail role in `Cleanup Tail`.
- Punch layer in `Bait-and-Punch`.
- Small overlap threat in `Pressure Window Wave` only after previews are clear.

**Avoid**
- Surprise lethal Runner packs with no preview.
- Hiding Runners behind Brutes before target priority tools/readability exist.
- Tuning HP so only one exact tower answer works.

## 3. Heavy anchor / Brute

**Gameplay question**
- Can the defense commit sustained damage into a high-HP target while other bodies are present?
- Did the player prepare anti-heavy value or only cheap coverage?

**Readable trait identity**
- Large, slow, heavy silhouette.
- Failure is visible early: it survives too long and pulls targeting attention.

**Tests these defenses / tower roles**
- Piercer / sustained anti-heavy role.
- Upgraded Arrow or focused single-target damage.
- Frost as kill-zone extension, not replacement damage.
- Targeting efficiency under mixed bodies.

**Wave grammar fit**
- Primary role in `Heavy Anchor`.
- Punch layer in `Bait-and-Punch`.
- Rare late anchor in escalation waves.

**Avoid**
- Pure sponge waves with no shape.
- Too many Brutes early.
- Combining Brute + fast tail + support aura + shield in the same first-use wave.

## 4. Swarm body-count pressure / Swarmling

**Gameplay question**
- Can the defense handle many small bodies without overkill waste?
- Did the player buy splash/cleanup or overinvest in single-target efficiency?

**Readable trait identity**
- Tiny, numerous, low-health units in readable clumps.
- The threat is count and spacing, not individual strength.

**Tests these defenses / tower roles**
- Burst / splash tower value.
- Cleanup coverage after splash leaves survivors.
- Targeting discipline and overkill efficiency.

**Wave grammar fit**
- Primary role in `Swarm Clump`.
- Cleanup layer after a Brute in later mixed waves.
- Children for `Splitter`.

**Avoid**
- Pixel soup where silhouettes merge.
- Counts so high the wave becomes performance/UI noise.
- Mixing large swarms with several special traits before the player can parse them.

## 5. Shielded / front-loaded durability check

**Gameplay question**
- Can the defense strip a visible durability layer before the unit reaches the danger zone?
- Does the build waste splash or low-value shots into a front-loaded shield while other threats move through?

**Readable trait identity**
- Clear outer shell/bar/flash separate from base HP.
- Shield is visible before and during damage intake.

**Tests these defenses / tower roles**
- Sustained fire and focus efficiency.
- Mixed placement where splash handles bodies while single-target strips shields.
- Upgrade timing before shield waves.

**Wave grammar fit**
- Small pair or light screen in `Bait-and-Punch`.
- Later modifier inside `Heavy Anchor` after Brute is understood.
- Limited durability check in `Pressure Window Wave` only if pressure readability stays clean.

**Avoid**
- Hidden resistance soup.
- Regenerating shields in MVP.
- Shields that require one exact damage type unless damage-type UI is already explicit.
- Shielded swarms; that combines body-count and durability noise too early.

## 6. Support carrier / escort amplifier

**Gameplay question**
- Can the defense identify and remove the high-value support target inside a group?
- Does the player understand priority, burst, and placement well enough to break the escort’s advantage?

**Readable trait identity**
- Distinct carrier silhouette with a visible aura/ring/link.
- Buff area is local, obvious, and disappears on carrier death.

**Tests these defenses / tower roles**
- Target priority and focused burst.
- Board layout that can reach the carrier, not only the lead enemy.
- Generic stream handling under a small amplifier.

**Wave grammar fit**
- Primary special in `Support Escort`.
- One support inside a moderate Grunt escort.
- Later: support near one Brute only after support basics are taught.

**Avoid**
- Hidden global buffs.
- Stacking auras.
- Speed auras early; they create leak spikes.
- Escort sizes that bury the carrier sprite.

## 7. Splitter / cleanup test

**Gameplay question**
- Can the defense handle post-kill cleanup after the main target dies?
- Does the build overkill the parent and then fail the children?

**Readable trait identity**
- Medium unit with clear split marker.
- On death, becomes a small fixed number of child units.

**Tests these defenses / tower roles**
- Splash plus cleanup pairing.
- Late-path coverage.
- Targeting and overkill waste.

**Wave grammar fit**
- Small feature in `Cleanup Tail` or `Bait-and-Punch`.
- Occasional spice in `Swarm Clump`, not the whole wave identity.
- Children should usually be Swarmling-like bodies.

**Avoid**
- Recursive splitting.
- Random child positions.
- Many Splitters in one wave.
- Death chains that hide what actually leaked.

## 8. Sprinter / burst-speed threat

**Gameplay question**
- Can the kill zone handle a short, telegraphed acceleration window?
- Does the player have enough path-depth coverage, not just front-loaded damage?

**Readable trait identity**
- Normal movement first, then visible wind-up/flash, then short sprint.
- Different from Runner because the danger is timed burst, not constant speed.

**Tests these defenses / tower roles**
- Deep coverage and second kill zone.
- Frost/control timing if applied before or during sprint.
- Pressure-window safety buffer.

**Wave grammar fit**
- Punch or tail in `Bait-and-Punch`.
- Late `Fast Probe` variant after Runner is mastered.
- PvP pressure-overlap threat only with strong preview.

**Avoid**
- Random sprint timing.
- Permanent high speed that makes it Runner+.
- First-use Sprinter combined with shield/support/split traits.

---

# Readable counters

Counters in Lil8TD should be understandable, not binary.

Good counter language:
- Burst is efficient into Swarmling clumps, but Arrow/Frost coverage can still help.
- Piercer or upgraded single-target is efficient into Brutes, but no one tower is mandatory.
- Frost helps Runners/Sprinters by extending time in range, but cannot replace damage.
- Focused burst helps Support Carriers, but generic damage can still win if the board is strong.

Bad counter language:
- “This enemy takes 30% damage unless you bought the correct tower.”
- hidden armor classes
- invisible speed/damage multipliers
- enemies that look identical but require different answers

Trait readability requirements:
- role is visible in silhouette at pixel scale
- special state has a clear effect marker: shield shell, aura ring, sprint flash, split marker
- wave preview names the main role/question when practical
- rules can be explained in one short line per enemy

Do not add hidden resistance soup. If a resistance or mitigation rule cannot be shown clearly, it is not V0-safe.

---

# Safe roster expansion rules

Add a new enemy only when it contributes one meaningful question the roster does not already ask.

## New unit checklist

A candidate deserves a new unit if:
- it changes player decisions before tuning numbers are considered
- it has a distinct readable trait or behavior
- it fits at least one existing wave template cleanly
- it has at least two soft counter routes
- it can be taught in isolation before mixed use

A candidate should stay a wave variant if:
- it is just Grunt with +20% HP
- it is just Runner with a different speed band
- it changes cadence/spacing/count but not enemy behavior
- it needs a hidden rule to be interesting

## Avoid cosmetic duplication

Before adding a unit, compare it to existing roles:
- More bodies? Probably Swarmling or wave spacing.
- More durability? Probably Brute or Shielded.
- More leak pressure? Probably Runner or Sprinter.
- More priority pressure? Probably Support Carrier.
- More after-kill cleanup? Probably Splitter.

If the answer is “same question, new skin,” do not add it yet.

## Introduction order

Recommended expansion path after the first 3 enemies:
1. Swarmling — gives Burst a clean job.
2. Shielded — adds visible durability sequencing.
3. Support Carrier — adds target-priority play.
4. Splitter — adds cleanup/death-behavior pressure.
5. Sprinter — adds timed burst speed once fast readability is proven.

This order can change if playtests show a clearer missing question, but do not introduce multiple new special roles in the same milestone.

---

# Relation to randomness

Enemy-level variation is allowed only when it preserves role readability and deterministic fairness.

## Allowed variations

Safe seeded/content-authored variations:
- small count changes inside a known wave template
- spacing/cadence changes that keep the same main question
- choosing between Grunt escort size A/B for a Support Carrier wave
- a Sprinter sprint threshold selected from a small visible set before match/wave start
- cosmetic palette variation that does not imply a different mechanic

These choices should be expanded into explicit wave data before simulation or revealed clearly through preview.

## Not allowed in V0

Avoid:
- in-combat random dodge, crits, or proc defenses
- hidden random enemy mutations
- random shield/armor types per spawn
- random sprint timing during the wave
- adaptive director changes based on who is winning
- visually identical enemies with different mechanical variants

## Variation must not break role readability

A variant can change **intensity** but not **identity**.

Examples:
- OK: Runner pack has slightly looser or tighter spacing.
- Not OK: one Runner in the pack secretly becomes a Sprinter.
- OK: Shielded unit has a slightly larger shield in an explicit hard variant.
- Not OK: shield sometimes resists splash invisibly.
- OK: Support Carrier escort uses Grunts or a single Brute in a named template.
- Not OK: support aura randomly changes from armor to speed.

---

# Implementation notes for ruleset data

Enemy data should eventually carry explicit design tags, not only numbers:

```text
roleId
roleFamily
readableTraits[]
primaryQuestion
softCounters[]
waveGrammarSlots[]
variantPolicy
```

Simulation can still use concrete fields like HP, speed, shield, aura, split, and sprint behavior. The role language is for content discipline, previews, bots, tests, and future roster review.

## V0 rule of thumb

If a playtester cannot answer “what was that enemy asking me to do?” after seeing it once or twice, the role is not ready.
