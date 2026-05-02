export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function stateHash(state) {
  const auth = {
    tick: state.tick, lives: state.lives, currency: state.currency, result: state.result,
    next: state.nextIds,
    towers: [...state.towers].sort((a,b)=>a.num-b.num).map(t => ({ id:t.id, typeId:t.typeId, tileX:t.tileX, tileY:t.tileY, level:t.level, cooldown:t.cooldown })),
    enemies: [...state.enemies].sort((a,b)=>a.num-b.num).map(e => ({ id:e.id, typeId:e.typeId, hp:e.hp, progress:e.progress, leaked:e.leaked, slow:e.slow })),
    spawns: state.spawnQueue.map(s => ({ tick:s.tick, enemyId:s.enemyId, laneId:s.laneId, source:s.source, waveIndex:s.waveIndex ?? -1 }))
  };
  let h = 2166136261;
  const text = stableStringify(auth);
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
