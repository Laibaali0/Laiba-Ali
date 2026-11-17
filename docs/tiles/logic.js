/* Four by Four: deterministic game rules, independent of the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FourByFour = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SIZE = 4;
  const emptyBoard = () => Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  const clone = board => board.map(row => row.slice());
  function assertBoard(board) {
    if (!Array.isArray(board) || board.length !== SIZE ||
        board.some(row => !Array.isArray(row) || row.length !== SIZE ||
          row.some(value => !Number.isInteger(value) || value < 0 ||
             (value !== 0 && (value & (value - 1)) !== 0)))) {
      throw new TypeError('Board must be a 4×4 grid of zeroes or powers of two');
    }
  }
  function collapse(line) {
    const values = line.filter(Boolean), merged = [];
    let gained = 0;
    for (let i = 0; i < values.length; i++) {
      if (i + 1 < values.length && values[i] === values[i + 1]) {
        const newValue = values[i] * 2;
        merged.push(newValue);
        gained += newValue;
        i++;
      } else merged.push(values[i]);
    }
    while (merged.length < SIZE) merged.push(0);
    return {line: merged, points: gained};
  }
  function move(board, direction) {
    assertBoard(board);
    if (!['left','right','up','down'].includes(direction)) throw new RangeError('Unknown direction');
    const next = emptyBoard();
    let points = 0;
    for (let index = 0; index < SIZE; index++) {
      let line = (direction === 'left' || direction === 'right')
        ? board[index].slice() : board.map(row => row[index]);
      if (direction === 'right' || direction === 'down') line.reverse();
      const result = collapse(line);
      points += result.points;
      const out = (direction === 'right' || direction === 'down') ? result.line.reverse() : result.line;
      for (let cell = 0; cell < SIZE; cell++) {
        if (direction === 'left' || direction === 'right') next[index][cell] = out[cell];
        else next[cell][index] = out[cell];
      }
    }
    const changed = next.some((row, r) => row.some((v, c) => v !== board[r][c]));
    return {board: next, points, changed};
  }
  function spawn(board, rng = Math.random) {
    assertBoard(board);
    const available = [];
    for (let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(board[r][c]===0) available.push([r,c]);
    if (!available.length) return {board: clone(board), spawned: null};
    const index = Math.min(available.length - 1, Math.max(0, Math.floor(rng() * available.length)));
    const [r,c] = available[index];
    const value = rng() < .9 ? 2 : 4;
    const next = clone(board);
    next[r][c] = value;
    return {board: next, spawned: {r,c,value}};
  }
  function hasMoves(board) {
    assertBoard(board);
    if (board.some(row => row.includes(0))) return true;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
      if (r < SIZE - 1 && board[r][c] === board[r+1][c]) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c+1]) return true;
    }
    return false;
  }
  function newGame(rng = Math.random) {
    const first = spawn(emptyBoard(), rng);
    const second = spawn(first.board, rng);
    return {board:second.board, score:0, won:false, over:false};
  }
  function step(state, direction, rng = Math.random) {
    if (state.over) return {state, changed:false, spawned:null};
    const result = move(state.board, direction);
    if (!result.changed) return {state, changed:false, spawned:null};
    const added = spawn(result.board, rng);
    const won = state.won || added.board.some(row=>row.some(v=>v>=2048));
    const next = {board:added.board,score:state.score+result.points,won,over:!hasMoves(added.board)};
    return {state:next, changed:true, spawned:added.spawned};
  }
  return {SIZE,emptyBoard,collapse,move,spawn,hasMoves,newGame,step,assertBoard};
});
