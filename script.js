const qs=s=>document.querySelector(s);
let subjects=[];
function save(){ localStorage.setItem('al_subjects_manual', JSON.stringify(subjects)); }
function load(){ const raw=localStorage.getItem('al_subjects_manual'); subjects=raw?JSON.parse(raw):[]; }

function renderList(){
  const el=qs('#examList'); el.innerHTML='';
  subjects.sort((a,b)=>new Date(a.date+'T'+(a.time||'00:00'))-new Date(b.date+'T'+(b.time||'00:00'))).forEach(s=>{
    const item=document.createElement('div'); item.className='exam-item';
    const left=document.createElement('div'); left.innerHTML=`<div style="font-weight:700">${s.name}</div><div class="small">${s.date} ${s.time}</div>`;
    const right=document.createElement('div'); right.className='meta';
    right.innerHTML=`<div class="countdown" data-date="${s.date}" data-time="${s.time}" data-name="${s.name}">--</div>`;
    item.appendChild(left); item.appendChild(right); el.appendChild(item);
  });
  updateCounts();
}

function updateCountdowns(){
  const now=new Date();
  subjects.forEach(s=>{
    const el=document.querySelector(`.countdown[data-date="${s.date}"][data-time="${s.time}"][data-name="${s.name}"]`);
    const target=new Date(s.date+'T'+(s.time||'00:00')); 
    let diff=Math.floor((target-now)/1000);
    if(diff<=0){ el.textContent='විභාග වේලාව!'; showCongrats(s);}
    else { const days=Math.floor(diff/86400); diff%=86400; const h=Math.floor(diff/3600); diff%=3600; const m=Math.floor(diff/60); const s2=diff%60;
      el.textContent=`${days}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s2).padStart(2,'0')}`;
    }
  });
  qs('#computedDays').textContent = daysInclusive(qs('#startDate').value, qs('#endDate').value) + ' (inclusive)';
}

function daysInclusive(start,end){ const a=new Date(start), b=new Date(end); return Math.floor((b-a)/(1000*60*60*24))+1; }

function showCongrats(sub){
  const canvas=qs('#confettiCanvas'); canvas.style.display='block'; canvas.width=innerWidth; canvas.height=innerHeight;
  const ctx=canvas.getContext('2d'); let pieces=[]; for(let i=0;i<120;i++) pieces.push({x:Math.random()*canvas.width,y:Math.random()*-canvas.height,h:Math.random()*12+6,vy:Math.random()*3+2,rx:Math.random()*360});
  let frames=0; const anim=()=>{ frames++; ctx.clearRect(0,0,canvas.width,canvas.height); for(const p of pieces){ p.y+=p.vy; p.x+=Math.sin(frames/10+p.y/50)*2; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rx*(Math.PI/180)); ctx.fillRect(-3,-p.h/2,6,p.h); ctx.restore(); } if(frames<180) requestAnimationFrame(anim); else { canvas.style.display='none'; ctx.clearRect(0,0,canvas.width,canvas.height); } }; anim();
  alert(`සුභ පැතුම් — ${sub.name} අද (${sub.date} ${sub.time})!\n\nසියලුම A/L විභාග කරන්නන්ට සුභ පැතුම්!`);
}

function updateCounts() {
  qs('#subjectCount').textContent = subjects.length;
  let visits = localStorage.getItem('al_user_visits');
  if(!visits) visits = 1; else visits = parseInt(visits)+1;
  localStorage.setItem('al_user_visits', visits);
  qs('#userCount').textContent = visits;
}

qs('#addBtn').addEventListener('click', ()=>{
  const name=qs('#subjectName').value.trim();
  const date=qs('#subjectDate').value;
  const time=qs('#subjectTime').value||"00:00";
  if(!name||!date){ alert('විෂය සහ දිනය සෙට් කරන්න'); return; }
  subjects.push({name,date,time}); save(); renderList();
});

qs('#clearBtn').addEventListener('click', ()=>{ if(confirm('සියල්ල ඉවත් කරන්න?')){ subjects=[]; save(); renderList(); } });
qs('#genBtn').addEventListener('click', ()=>{
  const s=qs('#startDate').value, e=qs('#endDate').value; if(!s||!e){ alert('දිනයන් සෙට් කරන්න'); return;}
  const start=new Date(s), end=new Date(e);
  for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    const dateStr=d.toISOString().slice(0,10); if(!subjects.some(x=>x.date===dateStr)) subjects.push({name:'(විෂය සෙට් කරන්න)',date:dateStr,time:'09:00'});
  } save(); renderList();
});

qs('#exportBtn').addEventListener('click', ()=>{
  const blob=new Blob([JSON.stringify({start:qs('#startDate').value,end:qs('#endDate').value,subjects},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='al_exam_schedule_manual.json'; a.click(); URL.revokeObjectURL(url);
});

qs('#importBtn').addEventListener('click', ()=>{
  const input=document.createElement('input'); input.type='file'; input.accept='application/json'; input.onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ try{ const data=JSON.parse(ev.target.result); if(data.subjects) subjects=data.subjects; if(data.start) qs('#startDate').value=data.start; if(data.end) qs('#endDate').value=data.end; save(); renderList(); }catch(err){alert('නොවලංගු ගොනුව');} }; r.readAsText(f);
  }; input.click();
});

qs('#askBtn').addEventListener('click', ()=>{
  const q=qs('#aiQuestion').value.trim();
  if(!q) return alert("ප්‍රශ්නය ටයිප් කරන්න.");
  qs('#aiAnswer').textContent="AI උපදෙස් ඉක්මනින් ලබා දෙනු ඇත.";
});

load(); renderList(); updateCountdowns(); setInterval(updateCountdowns,1000);