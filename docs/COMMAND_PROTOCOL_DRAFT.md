# Lil8TD Command Protocol Draft

## Purpose

This document defines the first draft of Lil8TD game-level command semantics.
It is not the transport protocol.
MultiWebCore owns transport/session/match protocol.
This document defines the payloads Lil8TD may send through the canonical input path.

## Design rules

1. Commands must be explicit
2. Commands must be small
3. Commands must be deterministic-friendly
4. Commands must not depend on UI-only state
5. Commands must be validated semantically by the Lil8TD sim layer

## Envelope relationship

Expected layering:
- MultiWebCore handles connection/session/room/match envelopes
- Lil8TD sends game commands as payloads inside the canonical tick input flow

## Candidate command families

## 1. `loadout.pick`

Purpose:
- choose the player loadout/package before match start or during allowed pre-start phase

Example shape:

```json
{
  "kind": "loadout.pick",
  "loadoutId": "balanced_alpha"
}
```

Validation:
- allowed only in valid pre-start state
- loadoutId must be known and allowed

## 2. `tower.build`

Purpose:
- request tower construction at a valid position

Example shape:

```json
{
  "kind": "tower.build",
  "towerType": "arrow_basic",
  "tile": { "x": 12, "y": 8 }
}
```

Validation:
- player has enough currency
- tower type is legal in current loadout
- tile is buildable
- tile does not violate path/block rules

## 3. `tower.upgrade`

Purpose:
- upgrade an existing tower along a valid path

Example shape:

```json
{
  "kind": "tower.upgrade",
  "towerId": "t_1042",
  "upgradeId": "arrow_pierce_1"
}
```

Validation:
- tower exists and belongs to player
- upgrade path exists
- enough currency
- upgrade is currently legal

## 4. `tower.sell`

Purpose:
- sell an owned tower for a defined refund

Example shape:

```json
{
  "kind": "tower.sell",
  "towerId": "t_1042"
}
```

Validation:
- tower exists and belongs to player
- tower is allowed to be sold in current state
- refund rules are deterministic and version-pinned

## 5. `ability.cast`

Purpose:
- activate a player ability if the design includes active abilities

Example shape:

```json
{
  "kind": "ability.cast",
  "abilityId": "overclock",
  "target": {
    "tile": { "x": 10, "y": 7 }
  }
}
```

Validation:
- ability exists
- cooldown/resource conditions pass
- target shape is valid

## 6. `pressure.send`

Purpose:
- spend currency or pressure resource to send extra threat to opponent

Example shape:

```json
{
  "kind": "pressure.send",
  "pressurePackId": "fast_swarm_small"
}
```

Validation:
- pressure pack exists
- state allows sending
- player can pay cost
- rate/timing rules pass

## 7. `ready.confirm`

Purpose:
- confirm readiness for match start from Lil8TD-side mode UI when needed

Example shape:

```json
{
  "kind": "ready.confirm"
}
```

Note:
This may end up redundant if MWC room-ready flow alone is sufficient.
Keep only if the game needs a separate pre-match content lock.

## Command ordering assumptions

- commands are submitted for canonical future ticks
- same canonical stream must produce same legal outcomes on compatible clients
- duplicate submissions should be safe to reject or de-dup cleanly

## Semantic failure categories

Recommended Lil8TD-side rejection reasons:
- `invalid_state`
- `unknown_command`
- `unknown_entity`
- `insufficient_resources`
- `illegal_position`
- `illegal_upgrade`
- `not_owner`
- `cooldown_active`
- `path_blocked`
- `loadout_restricted`

## Versioning note

Game command semantics should be pinned to:
- game version
- content version
- ruleset version
- map version when relevant

Do not allow ambiguous mixed-version command semantics in live matches.
