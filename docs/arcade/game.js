/* Signal Defender — original single-player arcade. Pure mechanics in logic.js. */
(() => {
  'use strict';
  const { clamp, overlaps, waveFor, spawnDelay, threatSpeed, rollType, points, formatScore } = window.ArcadeMath;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const ui = Object.fromEntries(['score','best','wave','lives','overlay','overlay-label','overlay-title','overlay-desc','start','announce','pause','mute','restart','left','right','shoot'].map(x=>[x,document.getElementById(x)]));
  const pressed = new Set();
  let state = 'ready';
  let score = 0, combo = 0, health = 3, shield = 0, elapsed = 0, spawnTimer = 0, shotTimer = 0;
  let threats = [], bolts = [], particles = [];
  let ship = {x: W/2-23, y:H-95,w:46,h:56};
  let previous = 0, frame = null, sound = false, audio = null;
  let lastWave = 1;
  let best = 0;
  try { best = Math.max(0, Number(localStorage.getItem('signal-defender-best')) || 0); } catch (_) {}
  let stars = Array.from({length:85},()=>({x:Math.random()*W,y:Math.random()*H,s:.3+Math.random()*1.4,z:Math.random()}));
  function updateHUD(){ui.score.textContent=formatScore(score);ui.best.textContent=formatScore(best);ui.wave.textContent=String(waveFor(score)).padStart(2,'0');ui.lives.textContent='♥ '.repeat(health).trim() || '—';}
  function overlay(tag,title,desc,action){ui['overlay-label'].textContent=tag;ui['overlay-title'].textContent=title;ui['overlay-desc'].textContent=desc;ui.start.textContent=action;ui.overlay.hidden=false;ui.announce.textContent=`${tag}: ${desc}`;}
  function tone(frequency, duration=.09){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const oscillator=audio.createOscillator(), gain=audio.createGain();oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);}catch(_){sound=false;}}
  function start(){score=0;combo=0;health=3;shield=0;elapsed=0;spawnTimer=0;shotTimer=0;lastWave=1;threats=[];bolts=[];particles=[];ship.x=W/2-23;state='playing';ui.overlay.hidden=true;ui.pause.textContent='PAUSE';pressed.clear();updateHUD();ui.announce.textContent='Mission started';}
  function resume(){state='playing';ui.overlay.hidden=true;ui.pause.textContent='PAUSE';previous=0;ui.announce.textContent='Mission resumed';}
  function pause(){if(state==='playing'){state='paused';pressed.clear();ui.pause.textContent='RESUME';overlay('GAME PAUSED','TAKE A BREATH.','The signal is safe until you resume.','▶ RESUME');}else if(state==='paused')resume();}
  function endGame(){state='over';pressed.clear();best=Math.max(best,score);try{localStorage.setItem('signal-defender-best',String(best));}catch(_){}updateHUD();tone(155,.3);overlay('MISSION COMPLETE',`SCORE ${formatScore(score)}`,`Reached wave ${waveFor(score)}. You collected ${combo} signals in your last streak. Try again?`,'↻ PLAY AGAIN');}
  function spawn(){const type=rollType(Math.random());const w=type==='stale'?45:type==='shield'?31:29;threats.push({x:35+Math.random()*(W-w-70),y:-60,w,h:w,vy:threatSpeed(waveFor(score))*(type==='shield'?.85:1)*(0.8+Math.random()*.45),type,phase:Math.random()*Math.PI*2});}
  function burst(x,y,color,n=12){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=35+Math.random()*150;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+Math.random()*.4,color})}}
  function shoot(){if(shotTimer>0)return;shotTimer=.18;bolts.push({x:ship.x+ship.w/2-3,y:ship.y,w:6,h:20,vy:-650});tone(760,.045);}
  function addScore(type){score+=points(type,combo);if(score>best)best=score;const newWave=waveFor(score);if(newWave>lastWave){lastWave=newWave;ui.announce.textContent=`Wave ${newWave} started`;tone(880,.18);}updateHUD();}
  function collidePlayer(t){
    if(t.type==='signal'){combo++;addScore('signal');burst(t.x+t.w/2,t.y+t.h/2,'#72fbe7');tone(920,.08);return;}
    if(t.type==='shield'){shield=6;combo++;addScore('shield');burst(t.x+t.w/2,t.y+t.h/2,'#a894ff');tone(1100,.15);return;}
    if(shield>0){burst(t.x,t.y,'#a894ff');tone(400,.06);return;}
    health--;combo=0;burst(ship.x+23,ship.y+20,'#ff789f',24);tone(175,.2);updateHUD();if(health<=0)endGame();
  }
  function update(dt){
    elapsed+=dt;shield=Math.max(0,shield-dt);spawnTimer+=dt;shotTimer=Math.max(0,shotTimer-dt);
    const move=((pressed.has('ArrowRight')||pressed.has('d')||pressed.has('right'))?1:0)-((pressed.has('ArrowLeft')||pressed.has('a')||pressed.has('left'))?1:0);
    ship.x=clamp(ship.x+move*390*dt,18,W-ship.w-18);
    if(pressed.has(' ')||pressed.has('fire'))shoot();
    const delay=spawnDelay(waveFor(score));while(spawnTimer>=delay){spawnTimer-=delay;spawn();}
    for(const star of stars){star.y+=12*dt*(1+star.z*3);if(star.y>H){star.y=0;star.x=Math.random()*W;}}
    for(const bolt of bolts)bolt.y+=bolt.vy*dt;
    for(const threat of threats) {threat.y+=threat.vy*dt;threat.phase+=dt*3;}
    for(const part of particles){part.x+=part.vx*dt;part.y+=part.vy*dt;part.life-=dt;}
    bolts=bolts.filter(b=>b.y>-30);particles=particles.filter(p=>p.life>0);
    const gone=new Set(),used=new Set();
    for(let i=0;i<threats.length;i++){
      const threat=threats[i];
      if(overlaps(ship,threat)){gone.add(i);collidePlayer(threat);if(state!=='playing')break;continue;}
      if(threat.type!=='stale')continue;
      for(let j=0;j<bolts.length;j++){
        if(used.has(j))continue;
        if(overlaps(threat,bolts[j])){gone.add(i);used.add(j);combo++;addScore('stale');burst(threat.x+23,threat.y+23,'#fb7fa8');tone(500,.055);break;}
      }
    }
    bolts=bolts.filter((_,i)=>!used.has(i));
    threats=threats.filter((t,i)=>!gone.has(i)&&t.y<H+75);
  }
  function line(x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function drawShip(){const x=ship.x,y=ship.y;ctx.save();ctx.translate(x,y);ctx.shadowColor=shield?'#b89bff':'#67f8ef';ctx.shadowBlur=shield?28:12;ctx.fillStyle=shield?'#a995ff':'#72f8e6';ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(45,51);ctx.lineTo(23,38);ctx.lineTo(1,51);ctx.closePath();ctx.fill();ctx.fillStyle='#08172c';ctx.beginPath();ctx.moveTo(23,13);ctx.lineTo(31,33);ctx.lineTo(15,33);ctx.fill();ctx.fillStyle='#ee78aa';ctx.fillRect(10,47,7,9+Math.random()*7);ctx.fillRect(29,47,7,9+Math.random()*7);ctx.restore();if(shield>0){ctx.strokeStyle='rgba(177,149,255,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+23,y+30,48,0,Math.PI*2);ctx.stroke();}}
  function drawThreat(t){const x=t.x+t.w/2,y=t.y+t.h/2;ctx.save();ctx.translate(x,y);if(t.type==='stale'){ctx.rotate(Math.sin(t.phase)*.12);ctx.shadowColor='#ff729c';ctx.shadowBlur=13;ctx.fillStyle='#e85586';ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h);ctx.fillStyle='#220b24';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('404',0,1);}else{ctx.shadowColor=t.type==='signal'?'#73fee5':'#b695ff';ctx.shadowBlur=20;ctx.rotate(.8);ctx.fillStyle=t.type==='signal'?'#72eddc':'#c2a4ff';ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h);ctx.shadowBlur=0;ctx.strokeStyle='#091427';ctx.lineWidth=3;ctx.strokeRect(-t.w/2+5,-t.h/2+5,t.w-10,t.h-10);}ctx.restore();}
  function draw(){ctx.fillStyle='#070e21';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(101,126,201,.12)';ctx.lineWidth=1;for(let x=0;x<W;x+=64)line(x,0,x,H,'rgba(114,110,192,.09)',1);for(let y=0;y<H;y+=64)line(0,y,W,y,'rgba(114,110,192,.09)',1);
    for(const s of stars){ctx.fillStyle=s.z>.7?'#b4adff':'#69d9eb';ctx.globalAlpha=.2+s.z*.65;ctx.fillRect(s.x,s.y,s.s,s.s)}ctx.globalAlpha=1;
    ctx.fillStyle='rgba(101,218,230,.14)';ctx.fillRect(0,H-45,W,1);
    for(const t of threats)drawThreat(t);
    ctx.fillStyle='#abfdfa';ctx.shadowColor='#70fbf2';ctx.shadowBlur=18;for(const b of bolts){ctx.fillRect(b.x,b.y,b.w,b.h)}ctx.shadowBlur=0;
    for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1;
    drawShip();ctx.font='15px monospace';ctx.fillStyle='#95a2d7';ctx.fillText(`DATA STREAM // ${String(Math.floor(elapsed)).padStart(3,'0')}s`,23,30);if(shield>0){ctx.fillStyle='#b99cff';ctx.fillText(`SHIELD ${shield.toFixed(1)}s`,W-158,30)}
  }
  function tick(time){if(!previous)previous=time;let dt=Math.min((time-previous)/1000,.045);previous=time;if(state==='playing')update(dt);draw();frame=requestAnimationFrame(tick);}
  ui.start.addEventListener('click',()=>state==='paused'?resume():start());
  ui.pause.addEventListener('click',pause);
  ui.restart.addEventListener('click',start);
  ui.mute.addEventListener('click',()=>{sound=!sound;ui.mute.textContent=sound?'SOUND ON':'SOUND OFF';ui.mute.setAttribute('aria-pressed',String(sound));if(sound)tone(620,.08);});
  const keys=new Map([['ArrowLeft','ArrowLeft'],['ArrowRight','ArrowRight'],['a','a'],['A','a'],['d','d'],['D','d'],[' ',' ']]);
  document.addEventListener('keydown',event=>{if(keys.has(event.key)){event.preventDefault();pressed.add(keys.get(event.key));}if(event.repeat)return;if(event.key.toLowerCase()==='p'){pause()}if(event.key.toLowerCase()==='r')start();if(event.key.toLowerCase()==='m')ui.mute.click();if(event.key==='Enter'&&state!=='playing'){state==='paused'?resume():start();}});
  document.addEventListener('keyup',event=>{if(keys.has(event.key))pressed.delete(keys.get(event.key));});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
  window.addEventListener('blur',()=>{if(state==='playing')pause();});
  const map={left:'left',right:'right',shoot:'fire'};
  for(const [id,key] of Object.entries(map)){
    const el=ui[id];
    el.addEventListener('pointerdown',event=>{event.preventDefault();pressed.add(key);el.setPointerCapture(event.pointerId)});
    const up=()=>pressed.delete(key);
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
  }
  canvas.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&event.buttons===1&&state==='playing'){const rect=canvas.getBoundingClientRect();ship.x=clamp((event.clientX-rect.left)/rect.width*W-ship.w/2,18,W-ship.w-18)}});
  updateHUD();draw();frame=requestAnimationFrame(tick);
})();
