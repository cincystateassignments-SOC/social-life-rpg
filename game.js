(()=>{
const world=document.querySelector('#world'),player=document.querySelector('#player'),avatar=document.querySelector('#avatarCanvas'),marker=document.querySelector('#marker'),viewport=document.querySelector('#viewport'),dialogue=document.querySelector('#dialogue'),line=document.querySelector('#line'),choices=document.querySelector('#choices');
const ctx=avatar.getContext('2d'); ctx.imageSmoothingEnabled=false;
const W=1345,H=620,CELL=8,COLS=Math.ceil(W/CELL),ROWS=Math.ceil(H/CELL);
let pos={x:548,y:486},raf=null,path=[],pending=null,frame=0,lastStep=0,dir='down',debug=false;
let look=JSON.parse(localStorage.getItem('qc-avatar')||'null')||{skin:1,hair:1,hairColor:0,shirt:0};
const spriteSheet=new Image(); spriteSheet.src='assets/player-sprites.png';
const collisionImage=new Image(); collisionImage.src='assets/collision-mask.png';
const collisionCanvas=document.createElement('canvas'); collisionCanvas.width=W; collisionCanvas.height=H; const collisionCtx=collisionCanvas.getContext('2d',{willReadFrequently:true});
let collisionReady=false;
collisionImage.onload=()=>{collisionCtx.drawImage(collisionImage,0,0,W,H);collisionReady=true;drawDebug()};
spriteSheet.onload=()=>drawAvatar(false);
// Dynamic NPC collision: feet positions in the flattened Queen City scene.
const actors=[[590,405,25],[770,360,25],[1165,390,25],[1244,438,25],[1174,552,28],[579,555,34],[535,455,25],[365,392,24],[285,365,23],[220,365,23],[914,285,35]];
function maskAllows(x,y){if(!collisionReady)return false;if(x<0||y<0||x>=W||y>=H)return false;return collisionCtx.getImageData(Math.round(x),Math.round(y),1,1).data[0]>127}
function isWalkable(x,y){if(!maskAllows(x,y))return false;for(const [ax,ay,r] of actors)if(Math.hypot(x-ax,y-ay)<r)return false;return true}
function nearestWalkable(x,y){if(isWalkable(x,y))return{x,y};for(let r=8;r<260;r+=8){for(let a=0;a<Math.PI*2;a+=Math.PI/20){const q={x:x+Math.cos(a)*r,y:y+Math.sin(a)*r};if(isWalkable(q.x,q.y))return q}}return {...pos}}
function key(c,r){return c+','+r} function center(c,r){return{x:c*CELL+CELL/2,y:r*CELL+CELL/2}}
function astar(start,end){
 const sc=Math.floor(start.x/CELL),sr=Math.floor(start.y/CELL),ec=Math.floor(end.x/CELL),er=Math.floor(end.y/CELL),open=[{c:sc,r:sr,g:0,f:0}],came=new Map(),g=new Map([[key(sc,sr),0]]),closed=new Set();
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 while(open.length){open.sort((a,b)=>a.f-b.f);const cur=open.shift(),ck=key(cur.c,cur.r);if(closed.has(ck))continue;closed.add(ck);if(cur.c===ec&&cur.r===er){let arr=[end],k=ck;while(came.has(k)){const [c,r]=k.split(',').map(Number);arr.push(center(c,r));k=came.get(k)}arr.reverse();arr.shift();return arr}
  for(const [dc,dr] of dirs){const c=cur.c+dc,r=cur.r+dr;if(c<0||r<0||c>=COLS||r>=ROWS)continue;const p=center(c,r);if(!isWalkable(p.x,p.y))continue;
   // No diagonal corner cutting through fences/planters.
   if(dc&&dr){const p1=center(cur.c+dc,cur.r),p2=center(cur.c,cur.r+dr);if(!isWalkable(p1.x,p1.y)||!isWalkable(p2.x,p2.y))continue}
   const nk=key(c,r),ng=cur.g+(dc&&dr?1.414:1);if(ng<(g.get(nk)??1e9)){g.set(nk,ng);came.set(nk,ck);open.push({c,r,g:ng,f:ng+Math.hypot(ec-c,er-r)})}
  }
 }
 return[];
}
function moveTo(x,y,action){const end=nearestWalkable(Math.max(22,Math.min(W-22,x)),Math.max(315,Math.min(H-14,y)));path=astar(pos,end);pending=action;if(!path.length&&Math.hypot(end.x-pos.x)>8){pending=null;return}marker.style.left=end.x+'px';marker.style.top=end.y+'px';marker.style.display='block';player.classList.add('walking');if(!raf)raf=requestAnimationFrame(tick)}
function tick(ts){if(!path.length){player.classList.remove('walking');marker.style.display='none';drawAvatar(false);const a=pending;pending=null;if(a)interact(a);raf=null;return}const t=path[0],dx=t.x-pos.x,dy=t.y-pos.y,d=Math.hypot(dx,dy);if(Math.abs(dx)>Math.abs(dy))dir=dx>0?'right':'left';else dir=dy>0?'down':'up';if(d<3){pos={x:t.x,y:t.y};path.shift()}else{const s=2.35;pos.x+=dx/d*s;pos.y+=dy/d*s}if(ts-lastStep>135){frame=(frame+1)%4;lastStep=ts;drawAvatar(true)}render();raf=requestAnimationFrame(tick)}
function drawAvatar(walking=false){
 ctx.clearRect(0,0,64,80);
 if(!spriteSheet.complete||!spriteSheet.naturalWidth)return;
 const row={down:0,left:1,right:2,up:3}[dir]??0;
 const col=walking?(frame%5):0;
 ctx.drawImage(spriteSheet,col*64,row*80,64,80,0,0,64,80);
}
function render(){player.style.left=pos.x+'px';player.style.top=pos.y+'px'}
function coords(e){const r=world.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('nav,#quest,#dialogue,#panel,#debugCanvas'))return;const h=e.target.closest('.hotspot');if(h){const a=h.dataset.action;if(a==='burns')moveTo(548,450,a);else if(a==='coffee')moveTo(470,400,a);return}const p=coords(e);moveTo(p.x,p.y,null)});
function showBurns(text){dialogue.classList.remove('hidden');document.body.classList.add('dialogue-open');line.textContent=text;choices.innerHTML='';QC_DATA.burns.choices.forEach(c=>{const b=document.createElement('button');b.textContent='▶ '+c.t;b.addEventListener('click',()=>{if(c.close)closeDialog();else{line.textContent=c.r;choices.innerHTML='';const back=document.createElement('button');back.textContent='◀ Ask something else';back.addEventListener('click',()=>showBurns(QC_DATA.burns.intro));choices.append(back)}});choices.append(b)})}
function interact(a){if(a==='burns')showBurns(QC_DATA.burns.intro);if(a==='coffee')openPanel('Riverbend Coffee','<p>The smell of coffee drifts through the open door. A handwritten notice reads:</p><p><b>NEW HOURS BEGIN THIS WEEK</b></p><p>Several people inside seem to be talking about the change. This will become the first full sociology investigation.</p>')}
function closeDialog(){dialogue.classList.add('hidden');document.body.classList.remove('dialogue-open')} document.querySelector('#closeDialog').addEventListener('click',closeDialog);
function avatarPanel(){return `<p><b>Your playable student</b></p><p>This build uses a real hand-drawn sprite sheet rather than JavaScript rectangles. The avatar now matches the scale and detail of Queen City's NPCs.</p><p><b>Customization:</b> the full layered character creator is the next asset pass; this build locks the approved blue-shirt/backpack student so movement and collision can be validated first.</p><button id="debugToggle" class="panelAction">${debug?'Hide':'Show'} collision debug overlay</button>`}
function openPanel(title,html){document.querySelector('#panelTitle').textContent=title;document.querySelector('#panelBody').innerHTML=html;document.querySelector('#panel').classList.remove('hidden');if(title==='Character'){document.querySelector('#debugToggle').addEventListener('click',()=>{debug=!debug;drawDebug();document.querySelector('#debugToggle').textContent=(debug?'Hide':'Show')+' collision debug overlay'})}}
document.querySelector('#closePanel').addEventListener('click',()=>document.querySelector('#panel').classList.add('hidden'));
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.menu;if(k==='character')openPanel('Character',avatarPanel());else openPanel(k[0].toUpperCase()+k.slice(1),QC_DATA.panels[k]||'<p>Coming soon.</p>')}));
window.addEventListener('keydown',e=>{if((e.key==='D'||e.key==='d')&&e.shiftKey){debug=!debug;drawDebug();return}if(!dialogue.classList.contains('hidden')||!document.querySelector('#panel').classList.contains('hidden'))return;let dx=0,dy=0;if(e.key==='ArrowLeft'||e.key==='a')dx=-48;if(e.key==='ArrowRight'||e.key==='d')dx=48;if(e.key==='ArrowUp'||e.key==='w')dy=-48;if(e.key==='ArrowDown'||e.key==='s')dy=48;if(dx||dy){e.preventDefault();moveTo(pos.x+dx,pos.y+dy,null)}});
// Development-only collision overlay: Shift+D toggles it. Students never need it.
const dbg=document.createElement('canvas');dbg.id='debugCanvas';dbg.width=W;dbg.height=H;world.appendChild(dbg);const dctx=dbg.getContext('2d');
function drawDebug(){dbg.style.display=debug?'block':'none';if(!debug||!collisionReady)return;dctx.clearRect(0,0,W,H);dctx.fillStyle='rgba(255,30,30,.26)';for(let y=0;y<H;y+=CELL)for(let x=0;x<W;x+=CELL)if(!isWalkable(x+CELL/2,y+CELL/2))dctx.fillRect(x,y,CELL,CELL);dctx.fillStyle='rgba(20,220,90,.14)';for(let y=0;y<H;y+=CELL)for(let x=0;x<W;x+=CELL)if(isWalkable(x+CELL/2,y+CELL/2))dctx.fillRect(x,y,CELL,CELL)}
drawAvatar(false);render();drawDebug();
})();
