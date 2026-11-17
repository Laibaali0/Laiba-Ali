/* Pure, deterministic mechanics shared by the browser game and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && typeof root === 'object') root.ArcadeMath = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function clamp(value, min, max) {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || min > max)
      throw new RangeError('Invalid clamp arguments');
    return Math.min(max, Math.max(min, value));
  }
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
      a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function waveFor(score) {
    if (!Number.isFinite(score) || score < 0) throw new RangeError('score must be nonnegative');
    return 1 + Math.floor(score / 300);
  }
  function spawnDelay(wave) {
    if (!Number.isInteger(wave) || wave < 1) throw new RangeError('wave must be positive integer');
    return Math.max(0.33, 1.05 - (wave - 1) * 0.068);
  }
  function threatSpeed(wave) {
    if (!Number.isInteger(wave) || wave < 1) throw new RangeError('wave must be positive integer');
    return Math.min(380, 138 + (wave - 1) * 15);
  }
  function rollType(random) {
    if (!Number.isFinite(random) || random < 0 || random >= 1) throw new RangeError('random must be in [0,1)');
    return random < 0.24 ? 'signal' : random < 0.29 ? 'shield' : 'stale';
  }
  function points(type, combo) {
    if (!Number.isInteger(combo) || combo < 0) throw new RangeError('combo must be a nonnegative integer');
    const base = { stale: 15, signal: 30, shield: 40 }[type];
    if (base === undefined) throw new RangeError('unknown entity type');
    return base * Math.min(4, 1 + Math.floor(combo / 5));
  }
  function formatScore(score) {
    if (!Number.isFinite(score) || score < 0) throw new RangeError('invalid score');
    return String(Math.floor(score)).padStart(6, '0');
  }
  return { clamp, overlaps, waveFor, spawnDelay, threatSpeed, rollType, points, formatScore };
});
