# Lil8TD Design Foundation: Loadout Packages

## Purpose

This document fixes the first design baseline for Lil8TD loadout/doctrine packages before coding.
It explains why MVP starts with compact packages instead of full races and defines the first three package archetypes.

This is a practical implementation anchor, not final lore or full faction design.

## Why packages before full races

MVP should start with **loadout/doctrine packages** because they create meaningful gameplay variation without multiplying balance, content, art, and networking risk.

Full races usually imply:
- separate tower rosters
- separate economies or tech trees
- unique enemy interactions
- distinct art identity
- wider tutorial burden
- more draft/balance edge cases

That is too much before the local deterministic sim, survival-collapse rules, and first pressure mechanic are proven.

Packages are the better MVP layer because they can vary:
- starting tower access
- unlock timing
- pressure relationship
- economic preference
- risk/reward profile

while still sharing the same core simulation, enemy roster, map rules, and command model.

The goal is to make players feel different strategic identities early without committing the project to full race production costs.

## Package design goals

Each package should create:

1. **A distinct playstyle**
   - The player should quickly understand what the package wants to do.
   - Identity should appear through access, timing, and board rhythm.

2. **Different risk/reward patterns**
   - Some packages stabilize early.
   - Some convert greed into later strength.
   - Some accept defensive tension to create pressure windows.

3. **Different starting tower access**
   - The first available towers should shape opening decisions.
   - Every package still needs one reliable early defense tool.

4. **Different pressure relation**
   - Packages may differ in how naturally they create, resist, or time pressure.
   - These differences must stay moderate for MVP.

5. **A clear weakness**
   - No package should be a generic best pick.
   - Weakness should be readable and playable around, not an automatic loss condition.

## Starting package archetypes

## 1. Balanced Core

### Identity / fantasy

The stable baseline doctrine.
Balanced Core represents clean fundamentals: solid early defense, flexible adaptation, and no extreme dependency on one timing window.

It should feel like the default competitive teaching package.

### Early tower access

Recommended early access:
- Arrow Tower
- Burst Tower
- Frost Tower or delayed Frost unlock

Balanced Core should have the cleanest access to basic single-target and anti-swarm tools.
It should not start with the strongest late-game anchor by default.

### Strategic preference

Balanced Core prefers:
- safe openings
- mixed tower composition
- steady upgrade timing
- adapting to wave composition instead of forcing one plan

It should reward correct fundamentals more than specialized combo knowledge.

### Pressure relation

Balanced Core has neutral pressure relation.

It can send pressure, but does not receive special pressure discounts or special pressure conversion.
Its strength is surviving long enough to choose good pressure moments.

### Intended strengths

- reliable early defense
- easiest package to learn
- flexible response to mixed waves
- low risk of being trapped by a bad opening
- good benchmark for balancing other packages

### Intended weaknesses

- fewer explosive timing windows
- less efficient at specialized control or pressure plans
- can lose tempo against sharper packages if played passively
- should not have the best version of every tower role

### Player served

Balanced Core serves players who want:
- a fair default
- stable openings
- fundamentals-first improvement
- a package that works in both solo and PvP without heavy specialization

## 2. Tempo Control

### Identity / fantasy

The positioning and efficiency doctrine.
Tempo Control wins by stretching time: slows, support value, kill-zone planning, and efficient stabilization under wave pressure.

It should feel clever and deliberate rather than brute-force powerful.

### Early tower access

Recommended early access:
- Arrow Tower or equivalent cheap baseline defender
- Frost Tower
- Support Beacon earlier than other packages, or earlier access to control upgrades

Tempo Control must still have one reliable direct damage tool.
It should not rely only on slow/support effects to survive early waves.

### Strategic preference

Tempo Control prefers:
- compact kill zones
- control-first layouts
- value upgrades over tower spam
- turning weaker raw damage into better uptime and efficiency

It should reward players who read paths, enemy speed, and tower synergy well.

### Pressure relation

Tempo Control is better at **absorbing** pressure than forcing it.

It can survive awkward pressure timings through slows and support efficiency, but its own pressure sends should not be cheaper or stronger than baseline in MVP.

### Intended strengths

- strong control identity
- good stabilization against fast or mixed waves
- high value from good placement
- supports memorable close-call holds
- teaches kill-zone construction

### Intended weaknesses

- weaker brute-force damage spikes
- can struggle against high-health waves if overinvested in control
- more placement-sensitive than Balanced Core
- may recover slowly after greedy or badly spaced openings

### Player served

Tempo Control serves players who want:
- strategic planning
- high placement expression
- defensive clutch moments
- a lower-apm but higher-layout-skill style

## 3. Pressure Forge

### Identity / fantasy

The aggressive conversion doctrine.
Pressure Forge turns economy and timing into opponent stress. It accepts a slightly thinner defensive baseline to create stronger pressure windows.

It should feel dangerous, proactive, and tense.

### Early tower access

Recommended early access:
- Arrow Tower or equivalent cheap baseline defender
- Burst Tower or another practical early clear tool
- delayed Frost/Support access compared to Tempo Control

Pressure Forge must be able to defend normal early waves reliably if played correctly.
Its risk should come from pressure spending and weaker stabilization tools, not from having no valid defense.

### Strategic preference

Pressure Forge prefers:
- early economy decisions with consequences
- timing pressure around opponent weak waves
- lean defense with active spending choices
- forcing the opponent to respond before their ideal upgrade timing

It should reward scouting, wave knowledge, and confidence under risk.

### Pressure relation

Pressure Forge has the strongest pressure relation of the first packages, but only moderately.

Possible MVP-safe expressions:
- slightly cheaper first pressure send
- slightly faster pressure resource conversion
- earlier access to the single pressure mechanic

Only one of these should be active at first.
Do not stack multiple pressure advantages before balance is proven.

### Intended strengths

- clearest proactive PvP identity
- creates sharable match moments through pressure timing
- punishes passive or greedy opponents
- makes the single MVP pressure mechanic more visible
- helps test whether pressure is fun and readable

### Intended weaknesses

- slightly weaker defensive comfort
- more vulnerable after failed pressure spends
- less forgiving against mixed or surprise waves
- weaker long stabilization if it cannot convert pressure into advantage

### Player served

Pressure Forge serves players who want:
- aggressive timing play
- risk/reward decisions
- visible PvP interaction
- matches with sharp momentum swings

## Balance guardrails

- Packages must not be hard counters to each other.
- Pressure differences must be moderate until PvP readability is proven.
- Every package needs one reliable early defense tool.
- Package identity should come from access, timing, and style, not raw stat cheating.
- Avoid hidden bonuses that are hard for opponents to understand.
- No package should require advanced hidden knowledge to be viable.
- Shared towers should remain recognizable across packages.
- If a package needs unique numbers, prefer small unlock/economy timing changes over large damage/health modifiers.
- Balance should be tested first against Balanced Core as the baseline reference.

## Future evolution

Packages can later become full-facing identities without changing the MVP foundation.

Possible wrappers:
- factions
- houses
- guilds
- machine doctrines
- pixel clans
- lore schools

The package layer should stay mechanically small even if presentation becomes richer.
A future faction can be mostly:
- name
- icon
- color treatment
- short fantasy hook
- package-specific UI framing
- maybe one advanced mechanic after the core loop is proven

Expansion should happen by adding one package at a time and testing it against the existing package set.
Do not add multiple new packages, towers, and pressure rules in the same balance step.

Recommended expansion order:
1. prove the three starter packages locally
2. test them against baseline bot profiles
3. test mirrored PvP with one pressure mechanic
4. add cosmetic/lore wrappers
5. add one new package only when the first three have stable roles

## Implementation implications

The code should represent package choice as data-driven access and timing rules, not as hardcoded race branches.

A package should be able to define:
- starting tower access
- unlock timing
- pressure modifier, if any
- economy preference, if any
- bot preference hints

The first implementation does not need full package UI.
It only needs enough structure to make package selection and deterministic simulation tests possible later.
