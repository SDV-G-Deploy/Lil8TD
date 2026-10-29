// Authoring source for content/ruleset.v0.json. Edit numbers here, then run:
//   node scripts/generate-ruleset.mjs
// Waves are authored from WAVE_TEMPLATE_GRAMMAR_V0 templates and compiled to explicit groups.
import { readFile, writeFile } from 'node:fs/promises';
const old = JSON.parse(await readFile('content/ruleset.v0.json','utf8'));
const r = {};
r.metadata = { ...old.metadata, version: '0.2.0', status: 'demo_vs_ai_baseline',
  notes: [
    'Demo ruleset: mirrored dual-board match vs AI with survival-collapse and pressure sends.',
    'One currency for builds, upgrades, sells and pressure sends (ECONOMY_MODEL_V0).',
    'Roster: Arrow, Burst, Frost, Piercer, Beacon; Grunt, Runner, Brute, Swarmling, Shielded, Warlord.',
    'Waves are authored from WAVE_TEMPLATE_GRAMMAR_V0 templates and compiled to explicit groups.'
  ] };
r.constants = { ...old.constants, initialLives: 20, defaultPathLengthUnits: undefined };
delete r.constants.defaultPathLengthUnits;
r.economy = { ...old.economy, startingCurrency: 220 };
r.map = {
  mapId: 'mossy_switchback_v1', version: '0.2.0', name: 'Mossy Switchback',
  lanes: [{ laneId: 'main', waypoints: [[0,1],[3,1],[3,5],[6,5],[6,2],[9,2],[9,6],[11,6]] }],
  buildRules: { gridWidth: 12, gridHeight: 8, blockedTiles: [[1,6],[10,0],[0,7]], pathTilesAreBlocked: true }
};
const L = (level, upgradeCost, o) => ({ level, upgradeCost, ...o });
r.towers = [
  { id:'arrow', name:'Arrow Tower', short:'Arrow', role:'baseline_single_target', blurb:'Cheap, quick single shots. Good everywhere.', buildCost:60, canActOnBuildTick:false, targeting:'first',
    levels:[ L(1,70,{damage:16,cooldownTicks:20,rangeUnits:2300,attackType:'instant_single'}), L(2,100,{damage:28,cooldownTicks:18,rangeUnits:2450,attackType:'instant_single'}), L(3,null,{damage:44,cooldownTicks:16,rangeUnits:2600,attackType:'instant_single'}) ] },
  { id:'burst', name:'Burst Tower', short:'Burst', role:'anti_swarm_small_splash', blurb:'Slow kettle-cannon. Splash shreds clumps and swarms.', buildCost:90, canActOnBuildTick:false, targeting:'first',
    levels:[ L(1,110,{damage:26,cooldownTicks:32,rangeUnits:2000,attackType:'instant_splash',splashRadiusUnits:700,splashFalloff:0.7}), L(2,160,{damage:38,cooldownTicks:32,rangeUnits:2100,attackType:'instant_splash',splashRadiusUnits:780,splashFalloff:0.75}), L(3,null,{damage:60,cooldownTicks:30,rangeUnits:2250,attackType:'instant_splash',splashRadiusUnits:860,splashFalloff:0.8}) ] },
  { id:'frost', name:'Frost Tower', short:'Frost', role:'control_slow_support', blurb:'Chills targets so every other tower gets more shots.', buildCost:90, canActOnBuildTick:false, targeting:'first', slowStacking:'strongest_wins_equal_or_stronger_refreshes',
    levels:[ L(1,100,{damage:6,cooldownTicks:24,rangeUnits:2150,attackType:'instant_single',slowPercent:35,slowDurationTicks:50}), L(2,140,{damage:10,cooldownTicks:22,rangeUnits:2300,attackType:'instant_single',slowPercent:45,slowDurationTicks:60}), L(3,null,{damage:16,cooldownTicks:20,rangeUnits:2450,attackType:'instant_single',slowPercent:55,slowDurationTicks:70}) ] },
  { id:'piercer', name:'Piercer Tower', short:'Piercer', role:'anti_heavy_sustained', blurb:'Long-range lance. Focuses the toughest target, cracks shields x2.', buildCost:130, canActOnBuildTick:false, targeting:'strongest', shieldDamageMultiplier:2,
    levels:[ L(1,140,{damage:90,cooldownTicks:46,rangeUnits:3200,attackType:'instant_single'}), L(2,200,{damage:140,cooldownTicks:42,rangeUnits:3400,attackType:'instant_single'}), L(3,null,{damage:220,cooldownTicks:38,rangeUnits:3600,attackType:'instant_single'}) ] },
  { id:'beacon', name:'Beacon Shrine', short:'Beacon', role:'support_aura_amplifier', blurb:'No attack. Towers in its glow deal bonus damage (best Beacon only).', buildCost:110, canActOnBuildTick:false, targeting:'none',
    levels:[ L(1,120,{damage:0,cooldownTicks:0,rangeUnits:1500,attackType:'aura',auraDamagePercent:25}), L(2,170,{damage:0,cooldownTicks:0,rangeUnits:1500,attackType:'aura',auraDamagePercent:40}), L(3,null,{damage:0,cooldownTicks:0,rangeUnits:2200,attackType:'aura',auraDamagePercent:55}) ] }
];
r.enemies = [
  { id:'grunt', name:'Grunt', role:'baseline_readability_anchor', blurb:'Baseline raider.', maxHp:110, speedUnitsPerTick:48, rewardCredits:5, leakDamage:1 },
  { id:'runner', name:'Runner', role:'fast_leak_threat', blurb:'Fast and fragile. Leaks if coverage is thin.', maxHp:70, speedUnitsPerTick:84, rewardCredits:5, leakDamage:1 },
  { id:'brute', name:'Brute', role:'slow_high_hp_pressure', blurb:'Slow wall of HP. Leaks cost 3 lives.', maxHp:560, speedUnitsPerTick:30, rewardCredits:16, leakDamage:3 },
  { id:'swarmling', name:'Swarmling', role:'swarm_body_count', blurb:'Tiny and numerous. Splash food.', maxHp:34, speedUnitsPerTick:58, rewardCredits:2, leakDamage:1 },
  { id:'shielded', name:'Shield Bearer', role:'front_loaded_durability', blurb:'Shield soaks damage first. Piercers crack it.', maxHp:150, maxShield:200, speedUnitsPerTick:40, rewardCredits:10, leakDamage:2 },
  { id:'warlord', name:'Moss Warlord', role:'boss_final_wave', blurb:'Final-wave boss. Leaking it costs 10 lives.', maxHp:4600, maxShield:1000, speedUnitsPerTick:20, rewardCredits:120, leakDamage:10 }
];
r.pressurePacks = [
  { id:'grunt_squad', name:'Grunt Squad', short:'Squad', costCredits:40, windupTicks:120, cooldownTicks:180, maxQueuedPerSender:2, unlockAtWaveIndex:1, visibleDuringWindup:true,
    delivery:{ laneId:'main', spawnSource:'pressure', groups:[{ enemyId:'grunt', count:8, firstOffsetTicks:0, intervalTicks:12, rewardCreditsOverride:1 }] } },
  { id:'runner_rush', name:'Runner Rush', short:'Rush', costCredits:60, windupTicks:120, cooldownTicks:240, maxQueuedPerSender:2, unlockAtWaveIndex:3, visibleDuringWindup:true,
    delivery:{ laneId:'main', spawnSource:'pressure', groups:[{ enemyId:'runner', count:8, firstOffsetTicks:0, intervalTicks:9, rewardCreditsOverride:1 }] } },
  { id:'brute_drop', name:'Brute Drop', short:'Brutes', costCredits:110, windupTicks:160, cooldownTicks:360, maxQueuedPerSender:1, unlockAtWaveIndex:5, visibleDuringWindup:true,
    delivery:{ laneId:'main', spawnSource:'pressure', groups:[{ enemyId:'brute', count:3, firstOffsetTicks:0, intervalTicks:36, rewardCreditsOverride:3 }] } }
];
const G = (enemyId, count, firstOffsetTicks, intervalTicks) => ({ enemyId, count, firstOffsetTicks, intervalTicks, laneId:'main' });
const W = [
  ['Baseline Stream', 80, [G('grunt',8,0,26)]],
  ['Fast Probe', 70, [G('grunt',6,0,24), G('runner',6,100,22)]],
  ['Swarm Clump', 80, [G('swarmling',16,0,8), G('grunt',5,150,24)]],
  ['Heavy Anchor', 90, [G('grunt',8,0,22), G('brute',2,60,90)]],
  ['Bait-and-Punch', 100, [G('runner',8,0,16), G('shielded',4,120,40)]],
  ['Swarm Clump II', 110, [G('swarmling',26,0,7), G('brute',2,120,80), G('grunt',6,200,20)]],
  ['Pressure Window', 120, [G('grunt',12,0,18), G('runner',8,60,16), G('shielded',4,160,36)]],
  ['Heavy Anchor II', 140, [G('brute',3,0,70), G('shielded',5,40,36), G('runner',8,200,14)]],
  ['Cleanup Tail', 160, [G('grunt',12,0,16), G('swarmling',22,80,6), G('brute',2,150,70), G('runner',10,260,12)]],
  ['Warlord', 170, [G('shielded',4,0,30), G('warlord',1,120,1), G('grunt',10,150,16), G('swarmling',20,240,6)]]
];
const SCALE = [100,105,113,124,136,148,160,172,186,202];
let t = 200;
r.waves = W.map(([template, payout, groups], i) => { const w = { waveIndex:i, template, startTick:t, hpScalePercent: SCALE[i], payoutOnStartCredits: i === 0 ? 0 : payout, groups }; t += i < 3 ? 480 : 560; return w; });
r.wavePhases = [
  { id:'early_teach_stable_defense', waveIndexes:[0,1,2] },
  { id:'mid_force_role_choice', waveIndexes:[3,4,5] },
  { id:'pressure_test_overlap_without_chaos', waveIndexes:[6,7] },
  { id:'escalation_expose_weak_plans', waveIndexes:[8,9] }
];
r.loadouts = old.loadouts;
await writeFile('content/ruleset.v0.json', JSON.stringify(r, null, 2) + '\n');
console.log('wrote content/ruleset.v0.json', r.metadata.version, 'waves at', r.waves.map(w => w.startTick).join(','));
