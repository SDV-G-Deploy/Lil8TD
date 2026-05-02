# Lil8TD Tower Role Language V0

## Purpose

This document defines the first tower role language for Lil8TD.

The goal is to let the tower roster and upgrades grow without becoming random `damage/range/cost` variants. Tower roles should describe the **gameplay job** a tower performs, the **readable identity** the player sees, and the **synergy hooks** that make mixed defenses understandable.

Use this document with:
- `docs/BALANCE_BASELINE_V0.md`
- `docs/CONTENT_PLAN_V0.md`
- `docs/DESIGN_FOUNDATION_LOADOUTS.md`
- `docs/ENEMY_ROLE_LANGUAGE_V0.md`
- `docs/GAMEPLAY_VARIETY_RANDOMNESS_PASS_V0.md`
- `docs/WAVE_TEMPLATE_GRAMMAR_V0.md`
- `content/ruleset.v0.json`

## Core rule: towers vary by job, not stat flavor

DPS, range, cooldown, and cost are tuning tools, not identity.

A good tower role changes at least one player decision:
- where to build the kill zone
- whether to answer speed, swarms, heavies, or mixed waves
- whether to spend on coverage, upgrade depth, control, or pressure
- which tower enables another tower instead of replacing it
- how much commitment is safe during PvP pressure windows

A weak tower role only says:
- same Arrow but more expensive
- same Burst but different color
- same Frost but slightly longer range
- hidden math bonus the player cannot read from board state

Every tower should be readable from sprite, projectile/effect, attack rhythm, and placement consequence.

---

# Starter tower roles

## 1. Baseline single-target / Arrow-style defender

**Gameplay job**
- Provide cheap, reliable early defense.
- Calibrate basic DPS, range, targeting, and economy.
- Fill coverage gaps without demanding a full synergy setup.

**Readable identity**
- Clean direct shot.
- Medium range, medium-fast rhythm, no special effect noise.
- The tower players trust as the neutral reference.

**Answers well**
- Grunt streams.
- Light Runner probes if placed with path depth.
- Early mixed waves before special answers are required.

**Weak against**
- Large swarms where overkill wastes shots.
- Brute-heavy waves if not upgraded or supported.
- Shield/sustain checks when used as the only plan.

**Loadout/package fit**
- Default filler in almost every MVP package.
- Good first-build option for new players and bots.
- Baseline comparison for balance tests.

**Avoid**
- Letting upgrades turn it into best anti-swarm and best anti-heavy at once.
- Giving it hidden priority tricks that make specialist towers obsolete.
- Making it so efficient that support/control choices become fake.

## 2. Anti-swarm splash / Burst-style clear

**Gameplay job**
- Convert clustered body count into efficient damage.
- Reduce overkill waste versus Swarmlings and dense Grunt groups.
- Create a clear reason to build wider than single-target spam.

**Readable identity**
- Slow-medium attack with visible small splash.
- Shorter or medium range so placement matters.
- Strong when enemies overlap, mediocre when they spread out.

**Answers well**
- Swarm Clump waves.
- Cleanup tails made of small bodies.
- Bait layers that try to soak single-target shots.

**Weak against**
- Brutes and Shielded units if tuned as low sustained DPS.
- Fast spaced Runners that avoid clumping.
- Lone high-value support carriers unless targeting and damage are favorable.

**Loadout/package fit**
- Core anti-swarm option in balanced packages.
- Natural pair with Arrow cleanup or Frost grouping.
- Should be optional early, then valuable once body-count waves arrive.

**Avoid**
- Huge splash radius that deletes every wave shape.
- High enough single-target damage to replace Arrow/Piercer.
- Visual explosions that hide enemy silhouettes in pixel scale.

## 3. Control / slow / Frost-style extender

**Gameplay job**
- Extend kill-zone time without replacing damage.
- Smooth fast leak threats and pressure overlaps.
- Make committed damage placements more valuable.

**Readable identity**
- Low damage, obvious slow effect, clear duration feedback.
- Attack rhythm/effect should make it obvious which enemies are controlled.
- Stacking rules must be simple: strongest wins or explicit capped stacking.

**Answers well**
- Runner and Sprinter timing threats when placed before danger zones.
- Brute waves when paired with sustained damage.
- PvP pressure overlap where extra time prevents panic leaks.

**Weak against**
- Very large swarms if slow does not include enough damage/coverage.
- Enemies already dying instantly; control adds little.
- Any wave if the player lacks actual damage behind it.

**Loadout/package fit**
- Control-first or support package identity.
- Pair with Burst for clump value and with Piercer/Spike for sustained uptime.
- Useful bot teaching tool because its value is visible in path progress.

**Avoid**
- Mandatory slow tuning where every serious build needs Frost.
- Permanent lockdown loops.
- Hidden slow immunity/resistance unless explicitly previewed and readable.

## 4. Anti-heavy sustained / Piercer-style commitment

**Gameplay job**
- Answer high-HP enemies through efficient sustained damage.
- Punish builds that only buy cheap coverage and splash.
- Give Brute/Shielded waves a specialist counter without hard-countering everything.

**Readable identity**
- Heavy shot, beam, pierce line, or focused rhythm that visually says “committed damage.”
- Slower turn/attack feel than Arrow.
- Good lane coverage or focus value, but not broad swarm cleanup.

**Answers well**
- Brutes.
- Shielded/front-loaded durability checks.
- Support Escort carriers if the player can expose or target them.

**Weak against**
- Swarmlings and many low-HP bodies.
- Fast spaced Runners that slip past slow attacks.
- Early economy pressure if bought too soon without coverage.

**Loadout/package fit**
- Specialist in balanced and damage-heavy packages.
- Natural payoff after Frost setup or Support Beacon investment.
- Should enter before Brute-heavy waves become common.

**Avoid**
- Lane pierce so wide that it becomes anti-swarm too.
- Burst damage so high that it acts as the best panic tower.
- Cost low enough that every opening rushes it.

## 5. Support / aura / Beacon-style amplifier

**Gameplay job**
- Reward intentional layouts and committed kill zones.
- Improve nearby tower efficiency without providing a complete answer alone.
- Create economy tension: invest in infrastructure now or immediate defense/pressure.

**Readable identity**
- Clear aura radius.
- Passive or periodic effect with simple icon/beam feedback.
- The affected towers should be obvious at a glance.

**Answers well**
- Sustained midgame waves when paired with enough damage towers.
- Brute/Shielded pressure through amplified focus.
- PvP tempo if built before the opponent’s pressure window and protected by coverage.

**Weak against**
- Panic defense; it does little without nearby towers.
- Wide scattered boards where aura value is low.
- Early Runner leaks if it delays actual damage.

**Loadout/package fit**
- Defines support/control packages.
- Encourages compact kill-zone architecture.
- Good late-first-phase or midgame investment, not default first tower.

**Avoid**
- Global buffs.
- Stacking aura soup.
- Hidden multipliers that make DPS math unreadable.
- Aura values so high every optimal board becomes one clump.

## 6. Anchor / high-commitment stabilizer / Spike-style tower

**Gameplay job**
- Provide expensive stabilization when the player commits economy.
- Create a power spike that can hold a section but exposes coverage/tempo weaknesses.
- Give late MVP waves a clear “I saved for this” defensive identity.

**Readable identity**
- Large footprint or strong sprite presence.
- Slow but impactful shot, charge, or focused burst.
- Feels expensive and deliberate, not like another normal tower.

**Answers well**
- Dangerous mixed waves if supported by cleanup/control.
- Brute anchors that need high commitment.
- Stabilizing one lane segment during pressure windows.

**Weak against**
- Swarms if no cleanup exists.
- Fast leaks outside its coverage or between slow shots.
- Economy punishment: saving for it can leave the board thin.

**Loadout/package fit**
- Late stabilizer in damage-heavy or greedy packages.
- Good payoff for Support/Frost setups.
- Should be rare enough that placement and timing are real decisions.

**Avoid**
- Making it solve all enemy roles alone.
- Making it cheap enough to be a normal midgame purchase.
- Giving it both huge range and huge AoE unless that becomes its explicit branch identity later.

---

# Readable synergies

Synergy should be visible as a board relationship, not hidden spreadsheet math.

## Setup / payoff relationships

Good pattern:
- one tower creates a condition the player can see
- another tower benefits from that condition
- the result changes placement/loadout decisions

Examples:
- Frost slows enemies inside a kill zone; Burst lands better clump hits.
- Frost holds Brutes longer; Piercer/Spike converts extra time into damage.
- Support Beacon marks an intentional cluster; Arrow/Piercer become more efficient there.

Avoid:
- invisible `+7% damage if target has tag X` with no icon/effect.
- synergies that require external calculators.
- synergies that are always optimal and have no placement or timing cost.

## Control + burst

Control can make burst readable when it creates clumps or keeps enemies inside splash windows.

Rules:
- show the slow/control state clearly.
- keep splash radius readable.
- tune so control improves Burst, but Burst still has independent anti-swarm value.

## Sustain + support

Support works best when paired with towers that fire long enough for the aura to matter.

Rules:
- affected towers must show they are buffed.
- aura radius must be visible during placement and selection.
- support should increase efficiency, not replace tower role weaknesses.

## Anti-heavy + cleanup

Anti-heavy towers should solve the main body; cleanup towers solve what leaks around it.

Good pairings:
- Piercer handles Brute; Arrow cleans Runners/Grunts.
- Spike chunks high-value targets; Burst/Arrow clears small bodies.
- Frost extends Brute uptime; Burst handles Swarmlings released or trailing behind.

Avoid tuning anti-heavy as broad AoE cleanup, or cleanup towers as best Brute killers.

## Make synergy obvious

Use:
- clear effects on affected enemies/towers
- preview tags in tower cards
- short role labels like `Control`, `Splash`, `Anti-Heavy`, `Aura`
- combat feedback that explains success/failure without opening a stats panel

Do not rely on:
- hidden resistance tables
- tiny fractional modifiers
- random proc chains
- offscreen/global effects

---

# Upgrade identity

Upgrades should deepen a tower’s role before they inflate numbers.

Good upgrades:
- Arrow: better reliability, range/targeting consistency, modest DPS.
- Burst: cleaner splash radius/falloff, better clump payoff, not huge single-target.
- Frost: longer control window, clearer uptime, capped stronger slow, not damage carry.
- Piercer: better sustained uptime, armor/shield stripping, lane commitment.
- Support Beacon: stronger/localized aura, clearer affected set, maybe one focused buff type.
- Spike: stronger charge/impact identity, longer commitment, not universal coverage.

A branch deserves to exist later when it creates a new decision:
- coverage branch versus focused damage branch
- control uptime branch versus clump setup branch
- support offensive aura versus defensive/utility aura
- Spike anti-heavy branch versus limited AoE anchor branch

A branch does **not** deserve to exist when it is only:
- `+damage` versus `++damage`
- same role with slightly different range
- a mathematically superior path in all common waves
- a hidden counter path without UI support

For MVP, prefer linear upgrades unless the branch can be explained in one sentence on the tower card.

---

# Safe tower expansion

Add a new tower only when it answers a missing gameplay job that existing roles cannot handle cleanly.

A new tower is justified if:
- a wave/enemy question has no readable answer in the roster
- an existing role is overloaded by too many jobs
- a loadout package needs a distinct playstyle, not just a different stat curve
- the tower creates a visible setup/payoff relationship

Do **not** add a new tower if it is really:
- an Arrow with different DPS/range/cost ratio
- a Burst with different radius color
- a Frost with a different slow number
- a Piercer upgrade that could be a branch later
- a Support Beacon tuning variant

Expansion checklist:
1. What enemy/wave question does it answer?
2. What role weakness keeps it from being universal?
3. What existing tower does it pair with?
4. What existing tower might it obsolete?
5. Can a player understand it from sprite/projectile/effect?

If answers are weak, keep it as an upgrade, modifier, or balance tuning pass.

---

# Randomness relation

Lil8TD can support tower-side randomness later only if it stays deterministic, seeded, bounded, and readable.

Allowed later, with caution:
- pre-match seeded upgrade offers, shown before selection locks.
- seeded tower modifiers in casual/bot modes, expanded into explicit match data.
- deterministic alternating shot patterns.
- visible charge windows or scripted overdrive cycles.
- cosmetic variation that does not affect simulation.

Not allowed for competitive MVP:
- random crits.
- random misses/dodge.
- random target retargeting beyond deterministic priority rules.
- hidden proc chances.
- adaptive tower buffs based on secret director logic.
- per-client randomness that can diverge simulation state.

Fairness rule:
- In mirrored PvP, any tower-side random content must be generated from match seed, visible before it matters, identical in rules for both players, and serialized in replay/checkpoint data.

If a random effect changes combat outcome but cannot be previewed and replayed exactly, it does not belong in MVP.

---

# V0 implementation implication

The current machine-readable ruleset correctly starts with:
- Arrow: `baseline_single_target`
- Burst: `anti_swarm_small_splash`
- Frost: `control_slow_support`

Next safe additions are:
1. Piercer / anti-heavy sustained, once Brute pressure needs a specialist.
2. Support Beacon, once layout/aura readability is testable.
3. Spike/anchor, once economy and upgrade commitment are readable.

Do not expand the roster faster than wave/enemy questions can prove each role matters.
