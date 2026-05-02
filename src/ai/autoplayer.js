export function createAutoplayer() {
  return { seq: 1, built: new Set(), upgraded: new Set(), buildPlan: [
    { tick: 1, towerType: 'arrow', x: 2, y: 1 },
    { tick: 90, towerType: 'arrow', x: 3, y: 3 },
    { tick: 430, towerType: 'burst', x: 4, y: 1 },
    { tick: 790, towerType: 'frost', x: 5, y: 3 },
    { tick: 1170, towerType: 'burst', x: 6, y: 1 },
    { tick: 1570, towerType: 'arrow', x: 1, y: 3 }
  ] };
}

export function autoplayerCommands(bot, state, content) {
  const commands = [];
  for (const item of bot.buildPlan) {
    const key = `${item.x},${item.y}`;
    if (state.tick >= item.tick && !bot.built.has(key)) {
      const cost = content.towers[item.towerType].buildCost;
      if (state.currency >= cost) { commands.push({ type:'tower.build', ...item, clientCommandSeq:bot.seq++ }); bot.built.add(key); }
      break;
    }
  }
  // Keep the smoke bot conservative: one economy mutation per tick avoids
  // same-tick affordability guesses and mirrors a simple scripted player.
  if (commands.length) return commands;
  const candidates = [...state.towers].sort((a,b)=>a.num-b.num);
  for (const t of candidates) {
    const def = content.towers[t.typeId]; const cur = def.levels[t.level - 1];
    if (cur?.upgradeCost != null && state.currency >= cur.upgradeCost + 20 && !bot.upgraded.has(`${t.id}:${t.level}`)) {
      commands.push({ type:'tower.upgrade', towerId:t.id, clientCommandSeq:bot.seq++ }); bot.upgraded.add(`${t.id}:${t.level}`); break;
    }
  }
  return commands;
}
