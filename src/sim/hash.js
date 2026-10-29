export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}

// FNV-1a over the authoritative match state (events and rejections are per-tick output, not state).
export function stateHash(match) {
  const auth = {
    tick: match.tick, result: match.result, wavesStarted: match.wavesStarted,
    boards: match.boards.map(b => ({
      slot: b.slot, lives: b.lives, currency: b.currency, collapsedTick: b.collapsedTick, next: b.nextIds,
      ready: b.pressureReadyTick,
      towers: [...b.towers].sort((x, y) => x.num - y.num).map(t => ({ id: t.id, typeId: t.typeId, tileX: t.tileX, tileY: t.tileY, level: t.level, cooldown: t.cooldown })),
      enemies: [...b.enemies].sort((x, y) => x.num - y.num).map(e => ({ id: e.id, typeId: e.typeId, hp: e.hp, shield: e.shield, progress: e.progress, slow: e.slow })),
      spawns: b.spawnQueue.map(s => ({ tick: s.tick, enemyId: s.enemyId, source: s.source })),
      incoming: b.incoming.map(p => ({ id: p.id, packId: p.packId, deliverTick: p.deliverTick }))
    }))
  };
  let h = 2166136261;
  const text = stableStringify(auth);
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
