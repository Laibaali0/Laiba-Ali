'use strict';
(function () {
  const game = window.FourByFour;
  const board = document.getElementById('board');
  const score = document.getElementById('score');
  const best = document.getElementById('best');
  const status = document.getElementById('status');
  const undo = document.getElementById('undo');
  const startButton = document.getElementById('new-game');
  const BEST_KEY = 'laiba-four-by-four-best-v1';
  let state = game.newGame(), previous = null, celebrated = false;
  function readBest() {
    try { const saved = Number(localStorage.getItem(BEST_KEY)); return Number.isSafeInteger(saved) && saved > 0 ? saved : 0; }
    catch (_) { return 0; }
  }
  let high = readBest();
  const cells = Array.from({length:16}, (_,i) => {
    const el=document.createElement('div');
    el.className='cell'; el.setAttribute('role','gridcell');
    el.setAttribute('aria-label',`Row ${Math.floor(i/4)+1}, column ${i%4+1}, empty`);
    board.appendChild(el); return el;
  });
  function render(message) {
    state.board.flat().forEach((value, index) => {
      const cell=cells[index];cell.dataset.value=String(value);
      cell.textContent=value===0?'':String(value);
      cell.setAttribute('aria-label', `Row ${Math.floor(index/4)+1}, column ${index%4+1}, ${value||'empty'}`);
    });
    score.textContent=String(state.score);
    if(state.score>high){high=state.score;try{localStorage.setItem(BEST_KEY,String(high));}catch(_) {}}
    best.textContent=String(high);
    undo.disabled=!previous;
    status.textContent=message;
  }
  function perform(direction) {
    const before=state;
    const outcome=game.step(state,direction);
    if(!outcome.changed){ render(state.over?'Game over. Try another round.':'No tiles moved. Try a different direction.');return; }
    previous=before;
    state=outcome.state;
    if(state.over) render('No moves left. Want to try again?');
    else if(state.won && !celebrated){celebrated=true;render('You made 2048! Keep going if you like.');}
    else render(`Moved ${direction}. Score ${state.score}.`);
  }
  const arrow={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};
  window.addEventListener('keydown', event => {
    const tag=event.target?.tagName?.toLowerCase();
    if(tag==='input'||tag==='textarea'||event.metaKey||event.ctrlKey||event.altKey)return;
    const dir=arrow[event.key]||arrow[event.key.toLowerCase?.()];
    if(dir){event.preventDefault();perform(dir);}
  });
  document.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('click',()=>perform(button.dataset.dir)));
  let touchStart=null;
  board.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  board.addEventListener('touchend',e=>{
    if(!touchStart||e.changedTouches.length!==1)return;
    const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;
    touchStart=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;
    perform(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');
  },{passive:true});
  startButton.addEventListener('click',()=>{state=game.newGame();previous=null;celebrated=false;render('New game. A fresh start.');board.focus();});
  undo.addEventListener('click',()=>{if(!previous)return;state=previous;previous=null;celebrated=state.won;render('Last move undone.');board.focus();});
  render('New game. Ready when you are.');
})();
