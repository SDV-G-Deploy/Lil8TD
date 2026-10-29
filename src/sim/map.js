// Path geometry for a lane defined by axis-aligned tile-center waypoints.
// All coordinates are integer "units": 1000 units per tile, tile centers at n*1000+500.
// Every function here is pure and integer-only so the simulation stays deterministic.

export const UNITS_PER_TILE = 1000;

export function buildLane(lane) {
  const pts = lane.waypoints.map(([x, y]) => ({ x: x * UNITS_PER_TILE + 500, y: y * UNITS_PER_TILE + 500 }));
  const segments = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (a.x !== b.x && a.y !== b.y) throw new Error(`lane ${lane.laneId}: segment ${i} is not axis-aligned`);
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    segments.push({ a, b, start: acc, len, dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) });
    acc += len;
  }
  const tiles = [];
  const seen = new Set();
  const tileDir = new Map();
  for (const seg of segments) {
    const steps = seg.len / UNITS_PER_TILE;
    for (let i = 0; i <= steps; i++) {
      const tx = (seg.a.x - 500) / UNITS_PER_TILE + seg.dx * i;
      const ty = (seg.a.y - 500) / UNITS_PER_TILE + seg.dy * i;
      const key = `${tx},${ty}`;
      const dirs = tileDir.get(key) ?? new Set();
      // record which sides of this tile the road touches, used by the renderer for straight/corner pieces
      if (i > 0) dirs.add(dirName(-seg.dx, -seg.dy));
      if (i < steps) dirs.add(dirName(seg.dx, seg.dy));
      tileDir.set(key, dirs);
      if (!seen.has(key)) { seen.add(key); tiles.push({ x: tx, y: ty }); }
    }
  }
  return { laneId: lane.laneId, points: pts, segments, length: acc, tiles, tileSet: seen, tileDirs: tileDir };
}

function dirName(dx, dy) { return dx > 0 ? 'E' : dx < 0 ? 'W' : dy > 0 ? 'S' : 'N'; }

// Integer point on the lane for a given progress (clamped to [0, length]).
export function pointAtProgress(laneGeo, progress) {
  const p = Math.max(0, Math.min(laneGeo.length, progress));
  const segs = laneGeo.segments;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (p <= s.start + s.len || i === segs.length - 1) {
      const d = p - s.start;
      return { x: s.a.x + s.dx * d, y: s.a.y + s.dy * d, dx: s.dx, dy: s.dy };
    }
  }
  return { ...laneGeo.points[0], dx: 1, dy: 0 };
}

export function dist2(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }

// How many lane sample points (every 250 units) are within `range` of a tile center.
// Used by bots and UI hints; deterministic and cheap enough to precompute.
export function laneCoverage(laneGeo, tileX, tileY, range) {
  const c = { x: tileX * UNITS_PER_TILE + 500, y: tileY * UNITS_PER_TILE + 500 };
  const r2 = range * range;
  let n = 0;
  for (let p = 0; p <= laneGeo.length; p += 250) if (dist2(c, pointAtProgress(laneGeo, p)) <= r2) n++;
  return n;
}
