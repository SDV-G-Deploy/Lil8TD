import { buildLane } from './map.js';

export function indexContent(ruleset) {
  const towers = Object.fromEntries(ruleset.towers.map(t => [t.id, t]));
  const enemies = Object.fromEntries(ruleset.enemies.map(e => [e.id, e]));
  const pressurePacks = Object.fromEntries((ruleset.pressurePacks ?? []).map(p => [p.id, p]));
  const waves = [...(ruleset.waves ?? [])].sort((a, b) => a.startTick - b.startTick);
  const lane = buildLane(ruleset.map.lanes[0]);
  const blockedSet = new Set((ruleset.map.buildRules.blockedTiles ?? []).map(([x, y]) => `${x},${y}`));
  return { ruleset, towers, enemies, pressurePacks, waves, lane, blockedSet, towerOrder: ruleset.towers.map(t => t.id), map: ruleset.map, constants: ruleset.constants, economy: ruleset.economy };
}

export function expandWaveSpawns(content) {
  const spawns = [];
  for (const wave of content.waves) {
    wave.groups.forEach((group, groupIndex) => {
      for (let i = 0; i < group.count; i++) {
        spawns.push({
          tick: wave.startTick + group.firstOffsetTicks + i * group.intervalTicks,
          waveIndex: wave.waveIndex,
          groupIndex,
          itemIndex: i,
          laneId: group.laneId,
          enemyId: group.enemyId,
          source: 'wave',
          rewardCreditsOverride: group.rewardCreditsOverride,
          hpScalePercent: wave.hpScalePercent ?? 100
        });
      }
    });
  }
  spawns.sort(compareSpawns);
  return spawns;
}

export function compareSpawns(a, b) {
  return a.tick - b.tick || a.waveIndex - b.waveIndex || a.groupIndex - b.groupIndex || a.itemIndex - b.itemIndex || a.laneId.localeCompare(b.laneId) || a.enemyId.localeCompare(b.enemyId);
}
