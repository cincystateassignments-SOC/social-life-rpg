(()=>{
const world=document.querySelector('#world'),player=document.querySelector('#player'),avatar=document.querySelector('#avatarCanvas'),marker=document.querySelector('#marker'),viewport=document.querySelector('#viewport'),dialogue=document.querySelector('#dialogue'),line=document.querySelector('#line'),choices=document.querySelector('#choices');
const ctx=avatar.getContext('2d');ctx.imageSmoothingEnabled=false;
let pos={x:590,y:420},raf=null,path=[],pending=null,frame=0,lastStep=0,dir='down';
let look=JSON.parse(localStorage.getItem('qc-avatar')||'null')||{skin:1,hair:1,hairColor:0,shirt:0};
const palettes={skin:['#f2c39d','#d79b72','#a96648','#6b3f2b'],hair:['#3b241d','#6a3d24','#17191b','#b77945'],shirt:['#287aa6','#7c3f91','#2e7653','#a64b3c']};
// Navigation grid: the artwork is scenery; this mask makes only visible plaza/path areas traversable.
const CELL=18,COLS=Math.ceil(1345/CELL),ROWS=Math.ceil(620/CELL);
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
const walkZones=[
 [[335,285],[665,260],[780,290],[1110,285],[1235,345],[1215,540],[1060,575],[820,600],[570,590],[385,545],[300,455]],
 [[165,305],[390,295],[455,350],[420,455],[240,470],[150,420]],
 [[475,420],[690,390],[840,425],[835,600],[500,600]],
 [[1080,350],[1295,365],[1300,600],[1080,600]]
];
const blocks=[
 {t:'circle',x:960,y:475,r:108}, // fountain and rail
 {t:'rect',x1:0,y1:0,x2:1345,y2:245}, // skyline/building/river backdrop
 {t:'rect',x1:115,y1:250,x2:435,y2:335}, // cafe facade
 {t:'rect',x1:0,y1:430,x2:310,y2:620}, // water/trees lower left
 {t:'rect',x1:1210,y1:330,x2:1345,y2:620}, // bus/road edge
 {t:'rect',x1:695,y1:250,x2:900,y2:330}, // river rail/viewing edge
 {t:'circle',x:420,y:505,r:55}, // large planter/tree cluster
 {t:'circle',x:735,y:545,r:50},
 {t:'circle',x:1120,y:515,r:55}
];
function isWalkable(x,y){if(x<28||x>1315||y<250||y>600)return false;if(!walkZones.some(p=>inPoly(x,y,p)))return false;for(const b of blocks){if(b.t==='rect'&&x>b.x1&&x<b.x2&&y>b.y1&&y<b.y2)return false;if(b.t==='circle'&&Math.hypot(x-b.x,y-b.y)<b.r)return false}return true}
function nearestWalkable(x,y){if(isWalkable(x,y))return{x,y};for(let r=12;r<220;r+=12){for(let a=0;a<Math.PI*2;a+=Math.PI/12){let q={x:x+Math.cos(a)*r,y:y+Math.sin(a)*r};if(isWalkable(q.x,q.y))return q}}return pos}
function nodeKey(c,r){return c+','+r} function center(c,r){return{x:c*CELL+CELL/2,y:r*CELL+CELL/2}}
function astar(start,end){const sc=Math.floor(start.x/CELL),sr=Math.floor(start.y/CELL),ec=Math.floor(end.x/CELL),er=Math.floor(end.y/CELL),open=[{c:sc,r:sr,g:0,f:0}],came=new Map(),g=new Map([[nodeKey(sc,sr),0]]),seen=new Set();const dirs8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];while(open.length){open.sort((a,b)=>a.f-b.f);const cur=open.shift(),ck=nodeKey(cur.c,cur.r);if(seen.has(ck))continue;seen.add(ck);if(cur.c===ec&&cur.r===er){let arr=[end],k=ck;while(came.has(k)){let [c,r]=k.split(',').map(Number);arr.push(center(c,r));k=came.get(k)}arr.reverse();arr.shift();return arr}for(const [dc,dr] of dirs8){let c=cur.c+dc,r=cur.r+dr;if(c<0||r<0||c>=COLS||r>=ROWS)continue;let p=center(c,r);if(!isWalkable(p.x,p.y))continue;let nk=nodeKey(c,r),ng=cur.g+((dc&&dr)?1.414:1);if(ng<(g.get(nk)??1e9)){g.set(nk,ng);came.set(nk,ck);let h=Math.hypot(ec-c,er-r);open.push({c,r,g:ng,f:ng+h})}}}return[]}
function moveTo(x,y,action){const end=nearestWalkable(Math.max(28,Math.min(1315,x)),Math.max(250,Math.min(600,y)));path=astar(pos,end);pending=action;marker.style.left=end.x+'px';marker.style.top=end.y+'px';marker.style.display='block';player.classList.add('walking');if(!raf)raf=requestAnimationFrame(tick)}
function tick(ts){if(!path.length){player.classList.remove('walking');marker.style.display='none';drawAvatar(false);let a=pending;pending=null;if(a)interact(a);raf=null;return}const t=path[0],dx=t.x-pos.x,dy=t.y-pos.y,d=Math.hypot(dx,dy);if(Math.abs(dx)>Math.abs(dy))dir=dx>0?'right':'left';else dir=dy>0?'down':'up';if(d<3.4){pos={x:t.x,y:t.y};path.shift()}else{let s=2.7;pos.x+=dx/d*s;pos.y+=dy/d*s}if(ts-lastStep>120){frame=(frame+1)%4;lastStep=ts;drawAvatar(true)}render();raf=requestAnimationFrame(tick)}
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function drawAvatar(walking=false){ctx.clearRect(0,0,36,52);const S=palettes.skin[look.skin],H=palettes.hair[look.hairColor],SH=palettes.shirt[look.shirt];const step=walking?(frame%2?2:-2):0;
// shadow
px(7,47,22,3,'rgba(0,0,0,.32)');
// legs / shoes
if(dir==='left'||dir==='right'){px(13+step,37,6,10,'#263544');px(20-step,37,6,10,'#263544');px(11+step,46,9,4,'#161b20');px(20-step,46,9,4,'#161b20')}else{px(10+step,37,7,11,'#263544');px(20-step,37,7,11,'#263544');px(8+step,46,10,4,'#161b20');px(19-step,46,10,4,'#161b20')}
// backpack behind body
if(dir==='up'||dir==='left'||dir==='right')px(dir==='left'?20:8,22,20,16,'#27435c');
// arms
px(5,23+Math.max(0,step),6,13,S);px(25,23+Math.max(0,-step),6,13,S);
// shirt + plaid pixels
px(9,20,19,19,SH);px(12,20,2,19,'#d6e5df');px(21,20,2,19,'#d6e5df');px(9,27,19,2,'#173a59');px(9,34,19,2,'#173a59');
// neck/head
px(15,16,7,6,S);px(9,5,19,17,S);
// ears
px(7,10,3,7,S);px(28,10,3,7,S);
// hair style
if(look.hair===0){px(9,3,19,5,H);px(7,6,5,8,H);px(25,5,5,7,H)}else if(look.hair===1){px(8,2,21,5,H);px(6,5,7,10,H);px(25,4,6,11,H);px(10,0,6,4,H);px(18,1,8,4,H)}else{px(8,1,21,6,H);px(6,5,6,13,H);px(26,5,5,13,H);px(8,15,5,5,H);px(24,15,5,5,H)}
if(dir!=='up'){px(13,11,3,2,'#172026');px(23,11,3,2,'#172026');px(17,16,5,1,'#9b5f4c')}else{px(10,5,18,4,H)}
// backpack straps / directional detail
if(dir==='down'){px(10,21,2,15,'#22394b');px(25,21,2,15,'#22394b')} if(dir==='left')px(25,23,3,12,'#22394b'); if(dir==='right')px(8,23,3,12,'#22394b');
}
function render(){player.style.left=pos.x+'px';player.style.top=pos.y+'px'}
function coords(e){const r=world.getBoundingClientRect(),sx=1345/r.width,sy=620/r.height;return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy}}
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('nav,#quest,#dialogue,#panel'))return;const h=e.target.closest('.hotspot');if(h){const a=h.dataset.action;if(a==='burns')moveTo(590,390,a);else if(a==='coffee')moveTo(500,360,a);return}const p=coords(e);moveTo(p.x,p.y,null)});
function showBurns(text){dialogue.classList.remove('hidden');document.body.classList.add('dialogue-open');line.textContent=text;choices.innerHTML='';QC_DATA.burns.choices.forEach(c=>{let b=document.createElement('button');b.textContent='▶ '+c.t;b.addEventListener('click',()=>{if(c.close)closeDialog();else{line.textContent=c.r;choices.innerHTML='';let back=document.createElement('button');back.textContent='◀ Ask something else';back.addEventListener('click',()=>showBurns(QC_DATA.burns.intro));choices.append(back)}});choices.append(b)})}
function interact(a){if(a==='burns')showBurns(QC_DATA.burns.intro);if(a==='coffee')openPanel('Riverbend Coffee','<p>The smell of coffee drifts through the open door. A handwritten notice reads:</p><p><b>NEW HOURS BEGIN THIS WEEK</b></p><p>Several people inside seem to be talking about the change. This interior will become the first full sociology investigation in the next content pass.</p>')}
function closeDialog(){dialogue.classList.add('hidden');document.body.classList.remove('dialogue-open')}document.querySelector('#closeDialog').addEventListener('click',closeDialog);
function avatarPanel(){return `<p><b>Your character</b></p><p>These choices now change the avatar you actually walk around Queen City with.</p><label>Skin tone <select id="skinSel">${palettes.skin.map((_,i)=>`<option value="${i}" ${i==look.skin?'selected':''}>${i+1}</option>`).join('')}</select></label><label>Hair style <select id="hairSel"><option value="0" ${look.hair==0?'selected':''}>Short</option><option value="1" ${look.hair==1?'selected':''}>Wavy</option><option value="2" ${look.hair==2?'selected':''}>Long</option></select></label><label>Hair color <select id="hairColorSel">${['Dark brown','Brown','Black','Auburn'].map((n,i)=>`<option value="${i}" ${i==look.hairColor?'selected':''}>${n}</option>`).join('')}</select></label><label>Shirt <select id="shirtSel">${['Blue','Purple','Green','Red'].map((n,i)=>`<option value="${i}" ${i==look.shirt?'selected':''}>${n}</option>`).join('')}</select></label><button id="saveAvatar" class="panelAction">Apply character design</button>`}
function openPanel(title,html){document.querySelector('#panelTitle').textContent=title;document.querySelector('#panelBody').innerHTML=html;document.querySelector('#panel').classList.remove('hidden');if(title==='Character'){document.querySelector('#saveAvatar').addEventListener('click',()=>{look={skin:+skinSel.value,hair:+hairSel.value,hairColor:+hairColorSel.value,shirt:+shirtSel.value};localStorage.setItem('qc-avatar',JSON.stringify(look));drawAvatar(false);document.querySelector('#panel').classList.add('hidden')})}}
document.querySelector('#closePanel').addEventListener('click',()=>document.querySelector('#panel').classList.add('hidden'));
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.menu;if(k==='character')openPanel('Character',avatarPanel());else openPanel(k[0].toUpperCase()+k.slice(1),QC_DATA.panels[k]||'<p>Coming soon.</p>')}));
window.addEventListener('keydown',e=>{if(!dialogue.classList.contains('hidden')||!document.querySelector('#panel').classList.contains('hidden'))return;let dx=0,dy=0;if(e.key==='ArrowLeft'||e.key==='a')dx=-54;if(e.key==='ArrowRight'||e.key==='d')dx=54;if(e.key==='ArrowUp'||e.key==='w')dy=-54;if(e.key==='ArrowDown'||e.key==='s')dy=54;if(dx||dy){e.preventDefault();moveTo(pos.x+dx,pos.y+dy,null)}});
drawAvatar(false);render();
})();
