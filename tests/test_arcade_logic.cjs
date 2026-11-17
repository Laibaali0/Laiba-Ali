'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const mechanics = require('../docs/arcade/logic.js');

test('clamp saturates within bounds',()=>{
  assert.equal(mechanics.clamp(-10,0,30),0);
  assert.equal(mechanics.clamp(40,0,30),30);
  assert.equal(mechanics.clamp(12,0,30),12);
  assert.throws(()=>mechanics.clamp(NaN,0,3),RangeError);
});
test('collision excludes touching edges and detects overlap',()=>{
  const player={x:10,y:10,w:20,h:20};
  assert.equal(mechanics.overlaps(player,{x:29,y:20,w:10,h:10}),true);
  assert.equal(mechanics.overlaps(player,{x:30,y:20,w:10,h:10}),false);
  assert.equal(mechanics.overlaps(player,{x:-25,y:20,w:10,h:10}),false);
});
test('wave progression tracks earned score',()=>{
  assert.equal(mechanics.waveFor(0),1);
  assert.equal(mechanics.waveFor(299),1);
  assert.equal(mechanics.waveFor(300),2);
  assert.equal(mechanics.waveFor(901),4);
  assert.throws(()=>mechanics.waveFor(-1),RangeError);
});
test('spawning speeds up but stops accelerating indefinitely',()=>{
  assert.ok(mechanics.spawnDelay(2)<mechanics.spawnDelay(1));
  assert.ok(mechanics.spawnDelay(30)>=.33);
  assert.ok(mechanics.threatSpeed(5)>mechanics.threatSpeed(1));
  assert.ok(mechanics.threatSpeed(100)<=380);
});
test('spawn probabilities map to all three entities',()=>{
  assert.equal(mechanics.rollType(0),'signal');
  assert.equal(mechanics.rollType(.25),'shield');
  assert.equal(mechanics.rollType(.75),'stale');
  assert.throws(()=>mechanics.rollType(1),RangeError);
});
test('combo multiplier is capped and scores are formatted',()=>{
  assert.equal(mechanics.points('stale',0),15);
  assert.equal(mechanics.points('signal',5),60);
  assert.equal(mechanics.points('signal',99),120);
  assert.equal(mechanics.formatScore(23),'000023');
  assert.throws(()=>mechanics.points('unknown',0),RangeError);
});
