const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../site/tiles/logic.js');
const board = rows => rows.map(r => r.slice());
test('starts with two tiles in different cells', () => {
  const start = game.newGame(()=>0);
  assert.equal(start.board.flat().filter(Boolean).length,2);
  assert.equal(start.score,0);
});
test('merges once per pair, with sum as score', () => {
  assert.deepEqual(game.collapse([2,2,2,2]),{line:[4,4,0,0],points:8});
  assert.deepEqual(game.collapse([2,2,4,0]),{line:[4,4,0,0],points:4});
  assert.deepEqual(game.collapse([4,4,8,8]),{line:[8,16,0,0],points:24});
});
test('left movement handles holes', () => {
  const result=game.move(board([[0,2,0,2],[0,0,0,0],[2,2,0,4],[0,0,0,0]]),'left');
  assert.deepEqual(result.board[0],[4,0,0,0]);
  assert.deepEqual(result.board[2],[4,4,0,0]);
  assert.equal(result.points,8);
});
test('right movement has correct order',()=>{
  const result=game.move([[2,2,4,4],[0,0,0,0],[0,0,0,0],[0,0,0,0]],'right');
  assert.deepEqual(result.board[0],[0,0,4,8]);
});
test('up movement merges columns',()=>{
  const result=game.move([[2,0,0,0],[2,0,0,0],[4,0,0,0],[4,0,0,0]],'up');
  assert.deepEqual(result.board.map(r=>r[0]),[4,8,0,0]);
});
test('down movement merges columns',()=>{
  const result=game.move([[2,0,0,0],[2,0,0,0],[4,0,0,0],[4,0,0,0]],'down');
  assert.deepEqual(result.board.map(r=>r[0]),[0,0,4,8]);
});
test('no-op does not spawn or change score',()=>{
  const state={board:[[2,4,8,16],[32,64,128,256],[512,1024,2,4],[8,16,32,64]],score:12,won:false,over:false};
  const result=game.step(state,'left',()=>.5);
  assert.equal(result.changed,false);
  assert.strictEqual(result.state,state);
});
test('spawn uses only empty slots, not changing input',()=>{
  const input=[[2,2,2,2],[2,2,2,2],[2,2,2,2],[2,2,2,0]];
  const {board:next,spawned}=game.spawn(input,()=>.99);
  assert.equal(next[3][3],4);
  assert.equal(input[3][3],0);
  assert.deepEqual(spawned,{r:3,c:3,value:4});
});
test('detects blocked and mergeable full boards',()=>{
  const full=[[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,2]];
  assert.equal(game.hasMoves(full),false);
  full[3][3]=4;
  assert.equal(game.hasMoves(full),true);
});
test('cannot use invalid directions or malformed grids',()=>{
  assert.throws(()=>game.move(game.emptyBoard(),'diagonal'),RangeError);
  assert.throws(()=>game.move([[1]],'up'),TypeError);
});
test('step adds a tile and carries the score',()=>{
  const state={board:[[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score:8,won:false,over:false};
  const next=game.step(state,'left',()=>0);
  assert.equal(next.state.score,12);
  assert.equal(next.state.board.flat().filter(Boolean).length,2);
});
test('winning and game-over flags computed correctly',()=>{
  const state={board:[[1024,1024,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score:0,won:false,over:false};
  const next=game.step(state,'left',()=>0);
  assert.equal(next.state.won,true);
  assert.equal(next.state.over,false);
});
