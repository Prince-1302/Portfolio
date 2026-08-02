/* ═══════════════════════════════════════════
   PRINCE KUMAR PORTFOLIO v2.0 — MAIN JS
   Cosmic Universe · Day/Night Toggle ·
   Experience · Animations · Interactions
═══════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────
   1. DAY / NIGHT THEME
───────────────────────────── */
const html = document.documentElement;

function getTheme() { return localStorage.getItem('pk-theme') || 'dark'; }
let cosmosTheme = getTheme();

function updateCosmosTheme(t) { cosmosTheme = t; }

function setTheme(t) {
  html.dataset.theme = t;
  localStorage.setItem('pk-theme', t);
  updateCosmosTheme(t);
}
setTheme(cosmosTheme);

function initThemeToggles() {
  const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')];
  toggles.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = html.dataset.theme;
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
}
initThemeToggles();

/* ─────────────────────────────
   2. LOADER
───────────────────────────── */
const loaderPct = document.getElementById('loaderPercent');
let loadVal = 0;
const loadInterval = setInterval(() => {
  loadVal = Math.min(loadVal + Math.random() * 18, 100);
  if (loaderPct) loaderPct.textContent = Math.floor(loadVal) + '%';
  if (loadVal >= 100) clearInterval(loadInterval);
}, 120);

window.addEventListener('load', () => {
  hideLoader();
});

// Failsafe in case window load hangs
setTimeout(hideLoader, 3500);

let loaderHidden = false;
function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  setTimeout(() => {
    document.body.classList.add('loaded');
    if (loaderPct) loaderPct.textContent = '100%';
    try { initReveal(); } catch(e){ console.error(e); }
    try { initCounters(); } catch(e){ console.error(e); }
    try { initHeroParticles(); } catch(e){ console.error(e); }
  }, 1000);
}

/* ─────────────────────────────
   3. COSMIC UNIVERSE CANVAS
───────────────────────────── */
const canvas = document.getElementById('cosmicCanvas');
const ctx = canvas.getContext('2d');
let W, H;
const mouse = { x: 0, y: 0 };
let time = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// Stars
const STAR_COUNT = 280;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.8 + 0.2,
  alpha: Math.random() * 0.7 + 0.15,
  twinkle: Math.random() * 0.02 + 0.004,
  offset: Math.random() * Math.PI * 2,
  pf: Math.random() * 0.04 + 0.01,
  color: (() => {
    const v = Math.random();
    return v < .2 ? '#93c5fd' : v < .38 ? '#c4b5fd' : v < .54 ? '#67e8f9' : '#ffffff';
  })()
}));

// Shooting stars
const shooters = [];
function spawnShooter() {
  if (Math.random() > 0.985) {
    shooters.push({ x: Math.random() * W, y: Math.random() * H * 0.4, vx: 5+Math.random()*5, vy: 2+Math.random()*3, len: 50+Math.random()*80, a: 1 });
  }
}

// Nebulas
const nebulas = [
  { rx:.15, ry:.25, r:380, c1:'#1a3a6f', o:.12, tilt:Math.PI/6 },
  { rx:.78, ry:.55, r:440, c1:'#2d1b69', o:.10, tilt:0 },
  { rx:.5,  ry:.1,  r:300, c1:'#0e4d4d', o:.08, tilt:Math.PI/8 },
  { rx:.88, ry:.2,  r:260, c1:'#3b1a6b', o:.09, tilt:Math.PI/4 },
  { rx:.2,  ry:.82, r:280, c1:'#0c2a5e', o:.08, tilt:Math.PI/3 },
];

// Solar system
const SUN = { rx: .82, ry: .35, r: 22 };
const planets = [
  { orbit:55,  speed:.018, r:5,  col:'#a78bfa', phase:0,   rings:false, moonR:0,  glowC:'rgba(167,139,250,.5)' },
  { orbit:92,  speed:.010, r:8,  col:'#60a5fa', phase:1.2, rings:false, moonR:12, glowC:'rgba(96,165,250,.5)' },
  { orbit:133, speed:.006, r:7,  col:'#f97316', phase:2.4, rings:false, moonR:0,  glowC:'rgba(249,115,22,.5)' },
  { orbit:178, speed:.004, r:13, col:'#fbbf24', phase:.8,  rings:true,  moonR:0,  glowC:'rgba(251,191,36,.5)' },
  { orbit:232, speed:.0025,r:10, col:'#34d399', phase:3.0, rings:false, moonR:0,  glowC:'rgba(52,211,153,.4)' },
];

// Neural nodes
const nodes = Array.from({ length: 26 }, () => ({
  x: Math.random(), y: Math.random(),
  vx: (Math.random()-.5)*.0003,
  vy: (Math.random()-.5)*.0003,
  r: Math.random()*2.5+1,
  a: Math.random()*.35+.1,
  phase: Math.random()*Math.PI*2,
  ps: Math.random()*.015+.005
}));

function updateCosmosTheme(t) { cosmosTheme = t; }

function drawBg() {
  const dark = cosmosTheme === 'dark';
  const grd = ctx.createLinearGradient(0,0,0,H);
  if (dark) {
    grd.addColorStop(0,'#020408');
    grd.addColorStop(.5,'#030610');
    grd.addColorStop(1,'#020408');
  } else {
    grd.addColorStop(0,'#dce7ff');
    grd.addColorStop(.5,'#e8f0ff');
    grd.addColorStop(1,'#dce7ff');
  }
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,W,H);
}

function drawNebulas() {
  nebulas.forEach(n => {
    const grd = ctx.createRadialGradient(n.rx*W, n.ry*H, 0, n.rx*W, n.ry*H, n.r);
    grd.addColorStop(0, cosmosTheme==='dark' ? n.c1 : n.c1.replace('1a','2a').replace('2d','3d').replace('0e','1e').replace('3b','4b').replace('0c','1c'));
    grd.addColorStop(1,'transparent');
    ctx.globalAlpha = cosmosTheme==='dark' ? n.o : n.o*.5;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(n.rx*W, n.ry*H, n.r*1.6, n.r, n.tilt, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawStars() {
  const dark = cosmosTheme === 'dark';
  const mx = (mouse.x/W-.5), my = (mouse.y/H-.5);
  stars.forEach(s => {
    const tw = Math.sin(time*s.twinkle*60+s.offset);
    const a = s.alpha*(0.5+0.5*tw) * (dark ? 1 : 0.25);
    const px = (s.x*W + mx*s.pf*W) % W;
    const py = (s.y*H + my*s.pf*H + window.scrollY*s.pf*.08) % H;
    ctx.globalAlpha = Math.max(0,a);
    if (s.r > 1.3) {
      const grd = ctx.createRadialGradient(px,py,0,px,py,s.r*3);
      grd.addColorStop(0,s.color);
      grd.addColorStop(1,'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(px,py,s.r*3,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(px,py,s.r,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawShooters() {
  for (let i=shooters.length-1;i>=0;i--) {
    const s=shooters[i];
    const grd=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*10,s.y-s.vy*10);
    grd.addColorStop(0,`rgba(255,255,255,${s.a})`);
    grd.addColorStop(1,'transparent');
    ctx.strokeStyle=grd; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*10,s.y-s.vy*10); ctx.stroke();
    s.x+=s.vx; s.y+=s.vy; s.a-=.024;
    if(s.a<=0) shooters.splice(i,1);
  }
}

function drawSolarSystem() {
  const sx=SUN.rx*W, sy=SUN.ry*H;
  // sun corona
  for(let r=SUN.r*7;r>SUN.r;r-=7){
    const g=ctx.createRadialGradient(sx,sy,SUN.r,sx,sy,r);
    g.addColorStop(0,'rgba(253,224,71,0.05)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
  }
  // sun
  const sg=ctx.createRadialGradient(sx-4,sy-4,2,sx,sy,SUN.r);
  sg.addColorStop(0,'#fffde7'); sg.addColorStop(.4,'#fde047'); sg.addColorStop(1,'#f59e0b');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,SUN.r,0,Math.PI*2); ctx.fill();

  planets.forEach(p=>{
    const angle=time*p.speed*60+p.phase;
    const px=sx+Math.cos(angle)*p.orbit;
    const py=sy+Math.sin(angle)*p.orbit*.38;
    // orbit ring
    ctx.globalAlpha=.07; ctx.strokeStyle='#fff'; ctx.lineWidth=.6;
    ctx.beginPath(); ctx.ellipse(sx,sy,p.orbit,p.orbit*.38,0,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
    // glow
    const gg=ctx.createRadialGradient(px,py,0,px,py,p.r*4);
    gg.addColorStop(0,p.glowC); gg.addColorStop(1,'transparent');
    ctx.globalAlpha=.65; ctx.fillStyle=gg;
    ctx.beginPath(); ctx.arc(px,py,p.r*4,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    // rings
    if(p.rings){
      ctx.save(); ctx.translate(px,py); ctx.scale(1,.3);
      ctx.globalAlpha=.38; ctx.strokeStyle=p.col; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,p.r*2.2,0,Math.PI*2); ctx.stroke();
      ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,p.r*2.9,0,Math.PI*2); ctx.stroke();
      ctx.restore(); ctx.globalAlpha=1;
    }
    // planet body
    const pg=ctx.createRadialGradient(px-p.r*.3,py-p.r*.3,p.r*.1,px,py,p.r);
    pg.addColorStop(0,lighten(p.col)); pg.addColorStop(1,p.col);
    ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(px,py,p.r,0,Math.PI*2); ctx.fill();
    // moon
    if(p.moonR){
      const ma=time*.09*60, mx=px+Math.cos(ma)*p.moonR, my=py+Math.sin(ma)*p.moonR*0.5;
      ctx.fillStyle='rgba(200,200,200,.8)';
      ctx.beginPath(); ctx.arc(mx,my,2,0,Math.PI*2); ctx.fill();
    }
  });
}

function drawNeural() {
  nodes.forEach(n=>{
    n.x+=n.vx; n.y+=n.vy;
    if(n.x<0||n.x>1)n.vx*=-1; if(n.y<0||n.y>1)n.vy*=-1;
    n.x=Math.max(0,Math.min(1,n.x)); n.y=Math.max(0,Math.min(1,n.y));
  });
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<.22){
        ctx.globalAlpha=(1-d/.22)*.07*(cosmosTheme==='dark'?1:.5);
        ctx.strokeStyle=cosmosTheme==='dark'?'#3b82f6':'#2563eb';
        ctx.lineWidth=.5;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x*W,nodes[i].y*H);
        ctx.lineTo(nodes[j].x*W,nodes[j].y*H);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha=1;
  nodes.forEach(n=>{
    const pulse=Math.sin(time*n.ps*60+n.phase)*.5+.5;
    ctx.globalAlpha=n.a*(0.4+0.6*pulse)*(cosmosTheme==='dark'?1:.6);
    const grd=ctx.createRadialGradient(n.x*W,n.y*H,0,n.x*W,n.y*H,n.r*6);
    grd.addColorStop(0,cosmosTheme==='dark'?'rgba(59,130,246,.3)':'rgba(37,99,235,.25)');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(n.x*W,n.y*H,n.r*6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=cosmosTheme==='dark'?'#60a5fa':'#3b82f6';
    ctx.beginPath(); ctx.arc(n.x*W,n.y*H,n.r*(0.8+0.4*pulse),0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;
}

function lighten(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+80)})`;
}

let lastT=0;
function cosmosLoop(ts){
  const delta=(ts-lastT)/1000; lastT=ts; time+=delta;
  ctx.clearRect(0,0,W,H);
  drawBg(); drawNebulas(); drawNeural(); drawStars();
  drawSolarSystem(); spawnShooter(); drawShooters();
  requestAnimationFrame(cosmosLoop);
}
requestAnimationFrame(cosmosLoop);

/* ─────────────────────────────
   4. HERO PARTICLES (floating)
───────────────────────────── */
function initHeroParticles(){
  const container=document.getElementById('heroParticles');
  if(!container)return;
  const count=20;
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    p.style.cssText=`
      position:absolute;
      width:${Math.random()*4+2}px; height:${Math.random()*4+2}px;
      background:${['#3b82f6','#8b5cf6','#06b6d4','#10b981'][Math.floor(Math.random()*4)]};
      border-radius:50%; opacity:${Math.random()*.4+.1};
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation:heroParticleFloat ${Math.random()*8+6}s ease-in-out ${Math.random()*4}s infinite;
    `;
    container.appendChild(p);
  }
  const style=document.createElement('style');
  style.textContent=`
    @keyframes heroParticleFloat{
      0%,100%{transform:translate(0,0) scale(1);}
      25%{transform:translate(${Math.random()*40-20}px,${Math.random()*40-20}px) scale(1.2);}
      75%{transform:translate(${Math.random()*40-20}px,${Math.random()*40-20}px) scale(.8);}
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────
   5. CUSTOM CURSOR
───────────────────────────── */
const dot=document.getElementById('cursor-dot');
const ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
});
(function cursorLoop(){
  rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(cursorLoop);
})();
document.querySelectorAll('a,button,.glass-card,.exp-card,.ach-card,.abt-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>ring.classList.add('hov'));
  el.addEventListener('mouseleave',()=>ring.classList.remove('hov'));
});

/* ─────────────────────────────
   6. NAVBAR
───────────────────────────── */
const navbar=document.getElementById('navbar');
const navLinks=document.querySelectorAll('.nav-link');
const sections=document.querySelectorAll('section[id]');
window.addEventListener('scroll',()=>{
  navbar.classList.toggle('scrolled',window.scrollY>40);
  let cur='';
  sections.forEach(s=>{ if(window.scrollY>=s.offsetTop-110)cur=s.id; });
  navLinks.forEach(l=>l.classList.toggle('active',l.dataset.section===cur));
},{passive:true});

// Hamburger
const ham=document.getElementById('hamburger');
const mobMenu=document.getElementById('mobileMenu');
ham.addEventListener('click',()=>{
  ham.classList.toggle('open');
  mobMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(l=>{
  l.addEventListener('click',()=>{ ham.classList.remove('open'); mobMenu.classList.remove('open'); });
});

/* ─────────────────────────────
   7. SCROLL REVEAL
───────────────────────────── */
function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('revealed'),i*70);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.1});
  document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el=>obs.observe(el));

  // Skills bars
  const skillObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('skills-animated');
        skillObs.unobserve(e.target);
      }
    });
  },{threshold:.2});
  document.querySelectorAll('.skills-grid').forEach(el=>skillObs.observe(el));
}

/* ─────────────────────────────
   8. COUNTER ANIMATION
───────────────────────────── */
function initCounters(){
  document.querySelectorAll('.hstat-val[data-target]').forEach(el=>{
    if(el.dataset.done)return;
    el.dataset.done='1';
    const target=+el.dataset.target;
    const suffix=el.dataset.suffix||'';
    const isSuffix=el.classList.contains('suffix');
    let cur=0; const step=target/50;
    const iv=setInterval(()=>{
      cur=Math.min(cur+step,target);
      el.textContent=Math.floor(cur)+(isSuffix?suffix:'');
      if(cur>=target){ el.textContent=target+(isSuffix?suffix:''); clearInterval(iv); }
    },30);
  });
}
new IntersectionObserver(e=>{ if(e[0].isIntersecting)initCounters(); },{threshold:.3})
  .observe(document.getElementById('hero'));

/* ─────────────────────────────
   9. TYPEWRITER
───────────────────────────── */
(function(){
  const roles=['AI-Powered Platforms','Full-Stack Web Apps','ML Solutions','Civic Tech Systems','Open Source Tools'];
  const el=document.getElementById('twText');
  if(!el)return;
  let ri=0,ci=0,deleting=false;
  function type(){
    const role=roles[ri];
    if(!deleting){
      el.textContent=role.slice(0,++ci);
      if(ci>=role.length){ deleting=true; setTimeout(type,1800); return; }
    } else {
      el.textContent=role.slice(0,--ci);
      if(ci===0){ deleting=false; ri=(ri+1)%roles.length; setTimeout(type,400); return; }
    }
    setTimeout(type,deleting?60:90);
  }
  setTimeout(type,600);
})();

/* ─────────────────────────────
   10. TILT on about cards
───────────────────────────── */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(700px) rotateX(${-y*8}deg) rotateY(${x*8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* ─────────────────────────────
   11. CONTACT FORM
───────────────────────────── */
document.getElementById('contactForm').addEventListener('submit',function(e){
  e.preventDefault();
  const btn=this.querySelector('.cf-submit');
  const ok=document.getElementById('cfSuccess');
  btn.style.opacity='.6'; btn.disabled=true;
  setTimeout(()=>{
    btn.style.opacity='1'; btn.disabled=false;
    ok.classList.add('show'); this.reset();
    setTimeout(()=>ok.classList.remove('show'),4000);
  },1200);
});

/* ─────────────────────────────
   12. PROFILE FALLBACK
───────────────────────────── */
(function(){
  const img=document.getElementById('profileImg');
  if(!img)return;
  img.addEventListener('error',()=>{
    img.style.display='none';
    const c=document.createElement('canvas');
    c.width=260; c.height=260;
    c.style.cssText='border-radius:50%;width:100%;height:100%;';
    const cx=c.getContext('2d');
    const g=cx.createLinearGradient(0,0,260,260);
    g.addColorStop(0,'#1a1f35'); g.addColorStop(1,'#0d1117');
    cx.fillStyle=g; cx.beginPath(); cx.arc(130,130,130,0,Math.PI*2); cx.fill();
    cx.font='bold 72px Space Grotesk,Inter,sans-serif';
    cx.textAlign='center'; cx.textBaseline='middle';
    const tg=cx.createLinearGradient(40,80,220,180);
    tg.addColorStop(0,'#60a5fa'); tg.addColorStop(.5,'#a78bfa'); tg.addColorStop(1,'#34d399');
    cx.fillStyle=tg; cx.fillText('PK',130,140);
    img.parentNode.insertBefore(c,img);
  });
})();

/* ─────────────────────────────
   13. SMOOTH SCROLL
───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const href = a.getAttribute('href');
    if(href === '#') return; // ignore empty hashes
    const t=document.querySelector(href);
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
  });
});

/* ─────────────────────────────
   14. STAGGER GRID ENTRIES
───────────────────────────── */
new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){
    entries[0].target.querySelectorAll('.ach-card').forEach((c,i)=>{
      c.style.opacity='0'; c.style.transform='translateY(30px)';
      setTimeout(()=>{
        c.style.transition='opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1)';
        c.style.opacity='1'; c.style.transform='translateY(0)';
      },i*100);
    });
  }
},{threshold:.1}).observe(document.querySelector('.ach-grid')||document.body);

/* ─────────────────────────────
   15. EXPERIENCE TIMELINE
       Animated entry on scroll
───────────────────────────── */
const expObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        e.target.style.opacity='1';
        e.target.style.transform='translateX(0) translateY(0)';
      },i*100);
      expObs.unobserve(e.target);
    }
  });
},{threshold:.1});

document.querySelectorAll('.exp-entry').forEach((el,i)=>{
  el.style.opacity='0';
  el.style.transform=i%2===0?'translateX(-20px)':'translateX(20px)';
  el.style.transition=`opacity .7s cubic-bezier(.16,1,.3,1) ${i*.08}s,transform .7s cubic-bezier(.16,1,.3,1) ${i*.08}s`;
  expObs.observe(el);
});

console.log('%c⚡ Prince Kumar Portfolio v2.0','color:#3b82f6;font-size:18px;font-weight:bold;');
console.log('%c"Building the future, one commit at a time."','color:#8b5cf6;font-style:italic;font-size:13px;');
