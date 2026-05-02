# Lil8TD Gameplay Variety + Smart Randomness Pass V0

## Purpose

This is a design pass on four related axes before more simulation/content code hardens assumptions:

1. enemy variety
2. wave variety
3. tower variety and synergies
4. small deterministic-friendly randomness / effects

The goal is **not** to make Lil8TD bigger. The goal is to make the compact roster produce more meaningful decisions while preserving readability, replay determinism, and competitive fairness.

## Executive summary

Current foundation is strong but intentionally sterile: the first machine-readable ruleset has 3 towers, 3 enemies, one lane, one pressure pack, and fully scripted waves. That is good for deterministic sim proof, but if carried too far it risks producing a TD where most decisions collapse into DPS-per-credit and timing memorization.

The best next variety layer should come from **interaction questions**, not content count:

- enemies should ask different defensive questions: coverage, focus fire, overkill waste, target priority, kill-zone durability, control timing, and splash hygiene.
- waves should vary by **shape**: cadence, layering, stagger, bait-and-punch, cleanup tail, pressure overlap window; not by random stat noise.
- towers should become expressive through **paired roles and upgrade hooks**, not many isolated tower types.
- randomness should be used only as **seeded pre-match/per-wave texture** with visible templates and bounded modifiers. Avoid in-combat hit RNG, crits, hidden enemy mutations, or adaptive director randomness for competitive MVP.

Recommended lock before coding more sim: define a tiny grammar for enemy traits, wave templates, tower tags/synergy hooks, and seeded variant generation. Keep V0 deterministic by expanding all seeded choices into explicit wave/variant data before the match starts.

---

## Where the foundation is currently too flat

### 1. Enemy roster is still mostly stat-vector shaped

The docs name strong roles, but the ruleset currently implements:

- Grunt: baseline hp/speed
- Runner: lower hp, higher speed
- Brute: higher hp, lower speed

That is correct for first simulation proof, but it only tests three axes: DPS, coverage/range, and sustained anti-heavy. The danger is that every future enemy becomes `hp/speed/reward/leakDamage` tuning instead of a new board question.

### 2. Waves are readable but memorization-heavy

Current waves are fixed scripts of Grunt/Runner/Brute with increasing counts and tighter spacing. That is ideal for smoke tests, but long-term it can become sterile: once a player knows wave 4 starts Runner/Brute overlap at tick X, the best build can become rehearsed.

This is especially risky in mirrored PvP: if both boards receive the same scripts, PvP pressure may become the only source of freshness. That can make pressure over-important.

### 3. Towers have roles, but not yet relationship hooks

Arrow/Burst/Frost is a good first trio:

- Arrow: baseline single target
- Burst: anti-swarm splash
- Frost: control extension

But the data currently describes mostly standalone outputs. There are no explicit tags like `physical`, `splash`, `control`, `mark`, `armorBreak`, `execute`, `aura`, `lanePierce`, or `setup/payoff`. Without hooks, synergy becomes accidental math rather than designed combinations.

### 4. Randomness policy says “avoid unless seeded,” but not “what kind is allowed”

The simulation contract correctly bans hidden/global randomness. What is missing is a content-design policy for deterministic randomness: what can be seeded, when it is revealed, how much it may affect outcome, and which systems must remain fixed.

---

# Enemy variety recommendations

## Principle: every enemy must ask a board question

Enemy variety should be evaluated by the question it asks the defender:

| Enemy axis | Good question | Risk if overused |
|---|---|---|
| Speed | Did you cover leak gaps and early path segments? | unfair surprise leaks |
| HP density | Did you invest in sustained or anti-heavy damage? | dull sponge math |
| Body count | Do you have splash/cleanup and target discipline? | visual clutter |
| Damage profile resistance | Is your damage mix too narrow? | hard-counter trap |
| Timing behavior | Can your kill zone handle burst windows? | unreadable spikes |
| Support trait | Can you prioritize a high-value target? | hidden aura confusion |
| Death behavior | Can you handle cleanup after overkill? | noisy chain reactions |
| Control interaction | Does slow/stall solve or fail here? | mandatory Frost or useless Frost |

## Enemy roster shape for MVP 6-8

Keep the existing first 3 as the teaching base, then add enemies that change decisions without creating a rules soup.

### 1. Grunt — baseline readability anchor

Keep as the neutral calibration unit. It should remain boring by design.

Design lock:
- no special trait
- fair reward
- used in mixed waves to reveal whether towers are over/under-tuned

### 2. Runner — fast leak threat

Runner should test **coverage and slow value**, not just require more DPS.

Design lock:
- low enough HP that correct coverage works
- high enough speed that poor placement leaks
- visually clear silhouette/color

Avoid:
- stacking too many runners behind Brutes if target priority cannot be controlled yet; this can feel like towers “ignored the real threat.”

### 3. Brute — high-HP pressure

Brute should test **commitment and anti-heavy planning**.

Design lock:
- slow enough that control helps but does not replace damage
- high leak damage so failure is meaningful
- reward should be decent but not enough to make Brute waves pure income

Avoid:
- making Brute just a giant Grunt. Give it wave-context identity: it should appear as an anchor inside mixed waves, not only as solo sponges.

### 4. Swarmling — body-count pressure

Add when Burst needs a clear job. This should be the first non-3 enemy added.

Board question:
- did you build splash/cleanup, or did you overinvest in single-target efficiency?

Recommended mechanics:
- very low HP
- medium-fast speed
- tiny reward
- low leak damage individually
- count/spacing tuned so splash matters more than raw damage

Readability guardrail:
- use fewer, more readable clumps before huge swarms. In pixel TD, 10 enemies with clean spacing beats 30 indistinct dots.

### 5. Shielded Unit — mixed damage / target sequencing check

Do **not** start with a broad “takes 50% damage from X” unless damage types are visible and taught. A better first shield is a **front-loaded shield layer**.

Board question:
- do you have enough sustained fire to strip the shield before the enemy reaches the danger zone?
- do you waste burst into shielded targets while swarms leak?

Recommended V0-safe model:
- `shieldHp` separate from `hp`
- shield absorbs normal damage first
- shield has a clear visual shell
- shield does not regenerate in MVP
- splash deals reduced or normal shield damage, but rule must be explicit

Why this is better than hidden resistance:
- player sees why the unit is taking longer
- deterministic and simple
- creates target-priority pressure without requiring damage-type UI yet

### 6. Support Carrier — target priority moment

This is high-value if kept simple. It creates enemy variety that is not hp/speed.

Board question:
- can the defense remove a support before its aura amplifies the group?

Recommended first support aura:
- nearby enemies get small speed reduction? No: speed buffs are leak-spiky.
- nearby enemies get small damage reduction? Better, but can be opaque.
- recommended: **shield trickle on spawn group only** or **flat temporary armor aura** with strong visual ring.

Best MVP-safe version:
- Carrier gives nearby enemies `+flatArmor` or `damageTakenMultiplier 0.85`
- aura radius small
- no stacking
- aura disappears immediately on death
- carrier itself is medium HP, medium speed

Avoid:
- hidden global buffs
- support chains
- multiple aura types
- speed aura before UI is mature

### 7. Splitter — death cleanup test

Splitter is interesting but risky. It can create noise if death events chain too much.

Board question:
- can your build handle post-kill cleanup and avoid overkill waste?

Recommended first model:
- on death, splits into 2 small Swarmlings
- children spawn at parent progress with slight deterministic offsets in path progress or spawn order, not random positions
- children have low HP and no further splitting

Use sparingly:
- one or two Splitters in a wave can be memorable
- many Splitters become visual garbage and may punish players after they think they succeeded

### 8. Sprinter — telegraphed burst-speed leak threat

Sprinter is only worth adding if it is not just Runner+. It needs a clear timing behavior.

Board question:
- can your kill zone handle a short acceleration window?

Recommended model:
- normal speed at spawn
- after reaching a path-progress threshold, gains a short scripted sprint
- threshold and duration are data-defined
- strong visual pre-sprint flash/animation

Avoid:
- random sprint timing
- constant high speed with only different stats from Runner

## Enemy axes that add fake complexity

Avoid these until much later:

- many elemental resistances before damage types are UI-first and intuitive
- armor tables with fractional hidden math
- enemies that disable towers or controls
- stealth/invisibility in a compact pixel TD
- random dodge/evasion
- crit immunity / crit vulnerability if crits exist at all
- enemies with several simultaneous traits in MVP
- support enemies whose effect is only visible in logs or tooltips

## Recommended enemy unlock order

1. Grunt / Runner / Brute: simulation proof
2. Swarmling: validates Burst and target clutter handling
3. Shielded Unit: validates sustained/mixed damage and target sequencing
4. Support Carrier: validates priority and readable aura UI
5. Splitter or Sprinter, not both at once: validates cleanup or timing spike

---

# Wave variety recommendations

## Principle: waves should vary by shape, not surprise math

The player should be able to look at the incoming wave preview and understand the problem type. Variety should come from the arrangement of known ingredients.

Useful wave dimensions:

1. **cadence** — dense clump vs loose stream
2. **layering** — fast units before/after heavies
3. **role contrast** — swarm + brute, runner + shield, support + grunt
4. **pressure window** — where a PvP send can overlap
5. **relief/recovery** — easier wave after a harsh check
6. **tail cleanup** — small late group that punishes overfocused kill zones

## Wave templates to define before content explodes

Use named templates in docs/data, even if they compile into explicit spawn groups.

### Template A: Baseline Stream

Purpose:
- teaches normal DPS/range

Shape:
- Grunts in readable spacing
- maybe a tiny Runner tail later

Good for:
- early waves
- economy calibration
- bot baseline

### Template B: Fast Probe

Purpose:
- checks coverage and Frost/range value

Shape:
- small Runner group early or late
- not enough to be lethal alone unless ignored

Good for:
- revealing thin defenses
- setting up later mixed waves

### Template C: Heavy Anchor

Purpose:
- tests anti-heavy commitment

Shape:
- Brute(s) embedded in Grunt stream
- Grunts keep towers busy while Brutes soak

Good for:
- Piercer/upgrade validation
- pressure overlap drama

### Template D: Swarm Clump

Purpose:
- validates Burst and splash positioning

Shape:
- low-HP bodies in compact but readable packets
- avoid full-screen spam

Good for:
- forcing anti-swarm spend
- punishing pure Arrow/Piercer builds

### Template E: Bait-and-Punch

Purpose:
- creates planning tension without hidden surprise

Shape:
- first small group baits tower cooldowns/targeting
- second stronger group arrives while cooldowns are cycling

Examples:
- Grunt trickle → Runner punch
- Swarmling clump → Brute anchor
- Shielded pair → Runner tail

Guardrail:
- preview must reveal both layers; this is not an ambush.

### Template F: Cleanup Tail

Purpose:
- punishes builds that only handle the first front of a wave

Shape:
- after the main group, a small tail of fast or swarm units

Good for:
- rewarding coverage depth
- preventing single kill-zone solves-all patterns

### Template G: Support Escort

Purpose:
- target priority and aura readability

Shape:
- Support Carrier plus moderate escort
- no additional complex enemy in same first-use wave

Good for:
- teaching support mechanics

### Template H: Pressure Window Wave

Purpose:
- deliberately creates a fair PvP timing opportunity

Shape:
- normal wave is moderate
- known weak interval where incoming pressure can overlap
- enough windup for opponent response

Important:
- these should be designed, not accidental. PvP pressure becomes better when the base wave has visible timing windows.

## Make waves less predictable but still readable

### Use seeded template variants, not random spawn chaos

For competitive modes, the match can select from a small set of equivalent wave variants using a shared seed. Both players see the same variant.

Example:

```text
Wave 5 template: Heavy Anchor
Variant A: 2 Brutes early + Grunt stream
Variant B: 1 Brute early, 1 Brute late + Grunt stream
Variant C: 2 Brutes mid-wave + slightly looser Grunts
```

Rules:
- all variants are pre-authored and balance-banded
- selected variant is expanded before match start
- wave preview shows the selected variant before it matters
- PvP mirrored boards receive identical base wave variant
- replay stores seed and/or expanded wave id

### Use phase-level pools

Do not let any wave roll any template. Each phase should have a curated pool.

Early phase:
- Baseline Stream
- Fast Probe small

Mid phase:
- Heavy Anchor
- Swarm Clump
- Cleanup Tail

Pressure phase:
- Pressure Window Wave
- Bait-and-Punch

Escalation:
- two-role mixes only; avoid three special traits at once

### Keep previews exact enough for fairness

For competitive play, “unknown wave variety” should mean the player does not know before the match which authored variant appears, not that they cannot see incoming threats in time.

Recommended preview policy:
- before match or before wave: show enemy icons/count bands or exact counts
- during windup: show pressure pack identity and arrival
- no hidden modifiers inside enemies once spawned

## Wave axes that create fake complexity

Avoid:

- purely random count changes every wave
- hidden stat multipliers
- adaptive director that punishes the player’s current build in ranked PvP
- too many simultaneous enemy traits in one wave
- randomized lane/path changes in MVP
- enemy spawn RNG during combat
- long waves that differ only by duration/count inflation

## Practical wave grammar proposal

Add a data/doc concept like:

```json
{
  "templateId": "heavy_anchor",
  "readabilityTier": 2,
  "rolesTested": ["anti_heavy", "targeting_under_stream"],
  "variants": [
    { "variantId": "early_anchor", "groups": [] },
    { "variantId": "late_anchor", "groups": [] }
  ]
}
```

The sim does not need to understand templates at runtime if that adds risk. A build/content step can expand template variants into ordinary deterministic `waves[]` groups.

---

# Tower variety + synergy recommendations

## Principle: compact towers need explicit relationship hooks

A 6-tower MVP can feel deep if towers create **setup/payoff**, **coverage tradeoffs**, and **layout dependencies**.

The current roles are right. The missing layer is explicit synergy tags and upgrade identities.

## Recommended tower tags

Introduce tags in content docs/data before adding many mechanics:

- `singleTarget`
- `splash`
- `control`
- `antiHeavy`
- `support`
- `anchor`
- `setup`
- `payoff`
- `coverage`
- `cleanup`
- `aura`
- `laneLinear`

These tags do not need direct sim meaning at first. They help docs, bots, tooltips, and balance tests reason about composition.

## Tower-by-tower direction

### Arrow Tower — baseline / coverage / cleanup

Arrow should stay useful but never optimal everywhere.

Good identity:
- cheap reliable coverage
- good at picking off medium/low HP enemies
- best emergency spend
- flexible upgrade baseline

Synergies:
- Frost extends Arrow uptime
- Support Beacon makes Arrow clusters efficient
- Arrow cleans up after Burst/Splitter interactions

Guardrail:
- if Arrow upgrades beat both Piercer vs Brutes and Burst vs swarms, the roster collapses.

### Burst Tower — anti-swarm / clump punish

Burst should not just be higher-cost Arrow with splash.

Good identity:
- strong vs Swarmling/clumps
- good when Frost or path geometry keeps enemies grouped
- weak into isolated Brutes and shielded high-HP targets

Synergies:
- Frost bunches enemies longer in splash zone
- Support Beacon can increase splash cadence/radius modestly
- Arrow/Piercer handle survivors and heavies

Design caution:
- splash targeting must be deterministic and readable. If Burst targets furthest enemy and splash catches behind, players should see why.

### Frost Tower — control / setup

Frost is the most dangerous tower for balance. It can become mandatory if every hard wave is solved by slow, or useless if raw DPS dominates.

Good identity:
- increases time in kill zones
- improves Burst clump value
- improves Arrow/Piercer uptime
- buys reaction time against Runner/Sprinter

Hard guardrails:
- slow stacking stays simple: strongest wins, equal-or-stronger refresh
- some enemies/waves should reduce Frost value through spacing or shield/HP density, not hard immunity
- Frost damage stays low

Recommended enemy interaction:
- Brutes still require damage even when slowed
- Runner waves should reward Frost but remain answerable by coverage
- Swarmling clumps become better Burst targets under Frost

### Piercer Tower — anti-heavy / lane-linear payoff

Add before Brute-heavy waves become central.

Good identity:
- line/lane value, sustained anti-heavy
- great where path alignment allows multiple hits or long tracking
- inefficient into widely spaced swarms

Possible deterministic mechanics:
- instant line pierce through enemies in a lane segment
- projectile with fixed travel and deterministic hit list
- bonus damage to shield or high-maxHP enemies, but visible as role text

Synergies:
- Frost keeps Brutes in pierce lane longer
- Support Beacon boosts slow cadence/damage efficiency
- Arrow/Burst handle leakage around Piercer focus

Avoid:
- generic “does more damage” anti-heavy tower with no placement expression.

### Support Beacon — aura / layout commitment

Support Beacon can make the board more expressive, but it risks creating solved clusters.

Good identity:
- rewards committed kill-zone layouts
- improves selected tower family through small, clear buff
- bad as emergency spend

Recommended first buff:
- attack cooldown multiplier or flat range/cadence bonus to nearby towers
- no random proc
- no complex per-tower exceptions initially

Guardrails:
- aura radius small enough that placement matters
- buff non-stacking or strongest-only
- UI must show affected towers clearly
- Beacon should not buff itself into a hidden damage source

Synergies:
- Beacon + Frost = control engine, low raw DPS
- Beacon + Burst = swarm zone
- Beacon + Piercer = anti-heavy lane battery
- Beacon + Arrow = cheap coverage cluster

### High-Cost Spike Tower — anchor / late stabilizer

The Spike Tower should be a commitment, not a universal panic button.

Good identity options:

Option A: focused high single-target execution
- excellent vs Brutes/Shielded after setup
- poor into swarms without cleanup

Option B: charged burst anchor
- fires big deterministic shot every long cooldown
- strong when Frost/Beacon keep enemies in range
- bad if wasted on tiny enemies

Option C: lane artillery with minimum range/slow turn
- very expressive placement
- probably too complex for first MVP unless UI supports it

Recommended MVP-safe pick:
- focused single-target / charged anchor with deterministic targeting.

## Synergy matrix to intentionally support

| Combo | Desired feeling | Counter-pressure |
|---|---|---|
| Arrow + Frost | safe coverage and leak control | Brutes outlast low DPS |
| Burst + Frost | satisfying clump clear | Shield/Brute waves punish low sustain |
| Piercer + Frost | heavy melt lane planning | Swarms and cleanup tails leak |
| Beacon + Arrow | efficient cheap fortress | Support/Shield/Brute may require specialization |
| Beacon + Burst | swarm blender | isolated fast leaks / Brutes |
| Beacon + Piercer | anti-heavy battery | swarm/runner pressure |
| Spike + Frost | clutch anchor hold | cooldown waste vs swarm/tail |
| Arrow + Burst | broad early stability | late heavy scaling |

## Upgrade variety: use branches carefully

Do not add branching upgrades before base roles are stable. But define future direction now so tower levels do not become pure stat inflation.

Recommended first upgrade identity pattern:

- Level 1: role introduction
- Level 2: role efficiency
- Level 3: role expression

Examples:

Arrow:
- L2: better cadence/range
- L3: choose later between `Rapid` cleanup or `Marksman` focus; not for first implementation

Burst:
- L2: better splash consistency
- L3 later: larger radius OR stronger center damage

Frost:
- L2: slow uptime
- L3 later: chill mark that increases first hit from non-Frost tower, if explicit and readable

Piercer:
- L2: line damage/cooldown
- L3 later: shield-break or extra pierce

Beacon:
- L2: aura strength/radius slight increase
- L3 later: specialization aura, but avoid multiple invisible buffs

Spike:
- L2/L3: commitment scaling; long cooldown remains weakness

## Tower axes that create fake complexity

Avoid for MVP:

- many damage types before enemies and UI teach them
- crit chance
- random proc towers
- towers requiring manual activation/micro
- overly clever targeting modes without UI
- support buffs with unclear stacking
- upgrade trees with three branches per tower
- towers whose value only appears in spreadsheet math

---

# Smart randomness recommendations

## Core rule

Randomness is allowed only if it is:

1. deterministic from match seed
2. expanded into authoritative state/data before it affects gameplay
3. mirrored/fair in PvP unless explicitly asymmetric by format
4. visible early enough for response
5. bounded so it cannot invalidate core build viability

## Good randomness for Lil8TD

### 1. Seeded wave variant selection

Best first use.

- select one variant from a curated set per wave/template
- same for both players in mirrored PvP
- reveal selected variant in wave preview
- store selected variant in replay

Why good:
- reduces rote memorization
- keeps competitive fairness
- preserves authored balance

### 2. Seeded cosmetic/effect variation

Safe and valuable for liveliness.

Examples:
- enemy spawn animation offset
- small sprite palette variation by enemy source
- deterministic hit spark variants
- pressure enemy badge variation

Rules:
- cosmetic RNG must not affect targeting, hitboxes, cooldowns, path progress, or hashes unless deliberately included as non-authoritative presentation state

### 3. Seeded map decoration / non-gameplay tile dressing

Safe if path/build legality remains fixed.

Examples:
- background props
- decorative debris
- animated water/lights

Avoid:
- random build-blocked tiles in MVP competitive mode

### 4. Seeded pressure timing windows through authored schedules

Not random pressure sends. Instead, certain waves can have variant timing that creates different pressure overlap opportunities.

Example:
- Wave 6 selected variant has Brutes early or late, changing best pressure timing.

This keeps PvP fresh without letting the game secretly sabotage one player.

### 5. Weighted bot personality choices

For solo vs AI, bots can use seeded weighted decisions among legal strategy templates.

Examples:
- greedy bot chooses between early upgrade or delayed pressure
- stable bot chooses between Arrow coverage positions

Rules:
- seeded per match
- logged/replayable
- no hidden cheats
- keep ranked PvP bots irrelevant unless bot fill is used

## Dangerous randomness

Avoid these strongly:

### In-combat hit RNG

No miss chance, crit chance, random damage rolls, dodge, random status application.

Why:
- undermines deterministic competitive trust
- makes close leaks feel unfair
- pushes players toward expected-value math instead of readable planning

### Hidden enemy modifiers

No “this Grunt randomly has +20% HP” unless it is visibly a named variant and previewed.

Why:
- player cannot diagnose failure
- bot/replay balance becomes messy

### Adaptive counter-generation

No director that notices player built Burst and sends Brutes in competitive MVP.

Why:
- feels like cheating
- breaks mirrored fairness
- makes loadout/package identity unstable

### Random tower targeting variance

No random target among candidates. Targeting tie-breakers stay deterministic and inspectable.

### Random pressure outcomes

A pressure send should not roll stronger/weaker delivery. Sender and defender must know what was bought.

## Deterministic-friendly implementation pattern

Use this pipeline:

```text
match seed + content version + ruleset version
  -> deterministic pre-match expansion
  -> selected wave variants / cosmetic seeds / bot plan seeds
  -> explicit authoritative schedule
  -> fixed tick sim consumes explicit schedule
```

For PvP:
- both clients/server receive same expanded base wave plan
- pressure commands remain explicit player actions
- pressure pack data is fixed, not rolled at send time unless the rolled variant is visible and command-authoritative

Replay should include either:
- seed + content versions + variant selection algorithm version, or
- fully expanded wave schedule

Recommendation:
- include both for debugging during early development.

## Allowed randomness matrix

| System | Solo | Ranked/competitive PvP | Notes |
|---|---:|---:|---|
| Wave variant selection | yes | yes, mirrored and previewed | best first randomness |
| Cosmetic VFX variation | yes | yes | non-authoritative preferred |
| Bot choices | yes | only bot slots | seeded/logged |
| Pressure pack random strength | no | no | bought pressure must be exact |
| In-combat crit/miss | no | no | avoid entirely |
| Enemy hidden stat rolls | no | no | use named variants only |
| Random map blockers | maybe casual later | no MVP | hurts fairness/readability |
| Random shop/loadout offers | maybe later mode | no MVP | changes competitive foundation |

## Small effects that make the game feel alive without chaos

Add “life” through deterministic/readable effects, not outcome RNG:

- visible pressure windup timeline pulse
- source-colored pressure enemy outline
- shield crack states at shield HP thresholds
- Frost slow tint and duration ring
- Support Carrier aura ring
- Beacon aura highlights on affected towers
- Burst splash footprint flash
- Spike charge bar / cooldown telegraph
- wave preview icons with template label: `Fast Probe`, `Heavy Anchor`, etc.

These increase perceived richness while keeping the sim clean.

---

# What to lock in docs before coding more sim

## High priority

1. **Enemy trait grammar**
   - Define allowed V0 traits: `shieldHp`, `aura`, `splitOnDeath`, `sprintPhase`, maybe `flatArmor`.
   - Explicitly ban hidden/random traits for MVP.

2. **Wave template grammar**
   - Add named wave templates and variant rules.
   - Clarify that runtime sim can still consume expanded `groups[]`.

3. **Tower tags and synergy hooks**
   - Add role tags to tower data/docs.
   - Define support aura stacking and Frost interactions before Beacon arrives.

4. **Randomness policy extension**
   - Expand `SIMULATION_CONTRACT.md` or a linked doc with allowed/disallowed randomness.
   - Define pre-match seeded expansion and preview rules.

## Medium priority

5. **Pressure overlap design rules**
   - Mark certain waves as pressure-window waves.
   - Balance pressure around designed overlap windows, not accidental spikes.

6. **Enemy readability budget**
   - Limit first-use waves to one new special trait at a time.
   - No wave should combine Support Carrier + Shielded + Splitter before each is separately taught.

7. **Bot hint fields**
   - Add content tags that bots can read: `threatTags`, `recommendedAnswers`, `waveTemplateId`.

## Lower priority

8. **Upgrade branch planning**
   - Document future branch fantasies, but do not implement branches until base levels are proven.

9. **Casual-mode randomness**
   - Save richer randomness for later non-ranked modes after deterministic competitive foundation is solid.

---

# Practical priority recommendations

## P0 — keep local foundation small

Do not expand implementation beyond Arrow/Burst/Frost and Grunt/Runner/Brute until deterministic smoke tests and first playable loop are real.

But while coding that, structure data so later variety fits:
- tower tags
- enemy optional traits object
- wave template/variant metadata
- `source` and `variantId` on spawn events
- seeded PRNG interface even if barely used

## P1 — add Swarmling before Shield/Support/Splitter

Swarmling gives Burst a real job and tests clutter/readability with low rules cost.

Add one Swarm Clump wave and one mixed Swarm + Brute wave.

## P2 — add Piercer before Brute scaling gets tuned too far

If Brutes are balanced only against Arrow/Frost/Burst, anti-heavy tuning will become distorted. Piercer should enter before the midgame heavy profile is finalized.

## P3 — introduce Shielded as visible shield layer, not resistance table

This creates meaningful target sequencing and sustained damage pressure without a damage-type labyrinth.

## P4 — introduce wave templates and seeded variants in docs/data

Even if the first sim uses fixed waves, design the content as templates. This prevents future wave variety from becoming ad hoc scripts.

## P5 — add Support Beacon only after aura UI can be clear

Beacon is high-value but UI-dependent. If players cannot see affected towers and expected value, it will feel like hidden math.

## P6 — add Support Carrier or Splitter, not both in same milestone

Both are interaction-rich and readability-risky. Add one, test, then decide.

## P7 — add deterministic wave variant selection after baseline wave balance

Do not randomize unbalanced waves. First author 2-3 variants per template with similar difficulty bands, then seed-select.

---

# Recommended next docs

1. `ENEMY_TRAIT_GRAMMAR_V0.md`
   - exact data schema for shield, aura, split, sprint
   - trait readability rules
   - trait stacking/ordering hooks for sim

2. `WAVE_TEMPLATE_GRAMMAR_V0.md`
   - named templates
   - variant selection policy
   - preview policy
   - expansion into deterministic spawn groups

3. `TOWER_SYNERGY_TAGS_V0.md`
   - tower tags
   - synergy matrix
   - support aura/Frost/Beacon stacking rules
   - bot-readable answer tags

4. `RANDOMNESS_POLICY_V0.md` or a section in `SIMULATION_CONTRACT.md`
   - allowed/disallowed randomness matrix
   - seeded pre-match expansion pipeline
   - replay requirements

If only one doc is created next, pick `WAVE_TEMPLATE_GRAMMAR_V0.md`; it bridges enemy variety, pressure timing, and deterministic randomness most directly.
