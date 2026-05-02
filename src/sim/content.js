export function indexContent(ruleset) {
  const towers = Object.fromEntries(ruleset.towers.map(t => [t.id, t]));
  const enemies = Object.fromEntries(ruleset.enemies.map(e => [e.id, e]));
  const waves = ruleset.waves ?? [];
  return { ruleset, towers, enemies, waves, map: ruleset.map, constants: ruleset.constants, economy: ruleset.economy };
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
          rewardCreditsOverride: group.rewardCreditsOverride
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
