require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

const MEMBERS = [
  { id: 'p1', name: 'AG',     color: '#185FA5' },
  { id: 'p2', name: 'Daniel', color: '#3B6D11' },
  { id: 'c1', name: 'Salome', color: '#BA7517' },
  { id: 'c2', name: 'Simon',  color: '#993556' },
];

function getClient(tokens) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
}

app.get('/', (req, res) => {
 res.setHeader('Content-Type', 'text/html; charset=utf-8');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.send(`<!DOCTYPE html>




Agenda Famille

*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}
body{background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.topbar{background:#fff;padding:14px 16px 10px;border-bottom:1px solid #eee}
.topbar h1{font-size:18px;font-weight:500}
.topbar p{font-size:12px;color:#888;margin-top:2px}
.members{display:flex;gap:8px;padding:12px 16px;background:#fff;border-bottom:1px solid #eee;overflow-x:auto}
.member{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:56px;cursor:pointer}
.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;border:2.5px solid transparent;position:relative}
.avatar.active{border-color:currentColor}
.avatar .dot{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;border:1.5px solid #fff}
.member span{font-size:10px;color:#888;text-align:center}
.tabs{display:flex;background:#fff;border-bottom:1px solid #eee}
.tab{flex:1;padding:10px;text-align:center;font-size:13px;color:#888;cursor:pointer;border-bottom:2px solid transparent}
.tab.active{color:#111;border-bottom-color:#111;font-weight:500}
.content{padding:16px}
.month-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.month-nav button{background:#fff;border:1px solid #eee;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:13px}
.month-nav span{font-size:15px;font-weight:500}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.cal-head{text-align:center;font-size:11px;color:#888;padding:4px 0}
.cal-day{min-height:38px;border-radius:8px;padding:3px;cursor:pointer;background:#f0f0f0}
.cal-day:hover{background:#e0e0e0}
.cal-day.today .day-num{background:#111;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center}
.day-num{font-size:11px;color:#666;font-weight:500;width:20px;height:20px;display:flex;align-items:center;justify-content:center}
.day-dots{display:flex;gap:2px;flex-wrap:wrap;margin-top:2px}
.dot{width:5px;height:5px;border-radius:50%}
.events-list{margin-top:16px}
.events-list h3{font-size:13px;color:#888;margin-bottom:8px}
.event-item{background:#fff;border:1px solid #eee;border-radius:10px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:10px}
.event-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.event-title{font-size:14px;color:#111}
.event-meta{font-size:11px;color:#888;margin-top:2px}
.add-btn{width:100%;padding:10px;margin-top:12px;background:none;border:1px dashed #ccc;border-radius:10px;cursor:pointer;font-size:13px;color:#888}
.task-item{background:#fff;border:1px solid #eee;border-radius:10px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:10px}
.check{width:18px;height:18px;border-radius:4px;border:1.5px solid #ccc;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center}
.check.done{background:#3B6D11;border-color:#3B6D11}
.check.done::after{content:'';width:5px;height:9px;border:2px solid #fff;border-top:0;border-left:0;transform:rotate(45deg) translate(-1px,-1px);display:block}
.task-text{flex:1;font-size:14px}
.task-text.done{text-decoration:line-through;color:#aaa}
.tag{font-size:10px;font-weight:500;padding:2px 7px;border-radius:12px}
.week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.week-col{display:flex;flex-direction:column;gap:4px}
.week-head{text-align:center;font-size:11px;color:#888;padding:4px 0;font-weight:500}
.meal-slot{min-height:44px;border-radius:8px;padding:6px;background:#fff;border:1px solid #eee;cursor:pointer}
.meal-label{font-size:9px;color:#aaa;margin-bottom:2px}
.meal-name{font-size:11px;font-weight:500;line-height:1.3}
.meal-empty{font-size:11px;color:#ccc;font-style:italic}
.connect-banner{background:#EAF3DE;border:1px solid #C0DD97;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#27500A;display:flex;align-items:center;justify-content:space-between;gap:8px}
.connect-btn{font-size:12px;padding:4px 10px;background:#3B6D11;color:#fff;border:none;border-radius:6px;cursor:pointer;white-space:nowrap}
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:100;align-items:center;justify-content:center}
.modal-bg.open{display:flex}
.modal{background:#fff;border-radius:16px;padding:20px;width:90%;max-width:380px}
.modal h2{font-size:16px;font-weight:500;margin-bottom:14px}
.form-row{margin-bottom:10px}
.form-row label{display:block;font-size:12px;color:#888;margin-bottom:4px}
.form-row input,.form-row select{width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.modal-actions{display:flex;gap:8px;margin-top:14px}
.btn-cancel{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;cursor:pointer;background:none;font-size:13px;color:#888}
.btn-save{flex:1;padding:8px;border:none;border-radius:8px;cursor:pointer;background:#111;color:#fff;font-size:13px;font-weight:500}
.section-title{font-size:12px;color:#888;font-weight:500;margin:12px 0 6px}



Familledimanche 5 avril 2026
AGAGDaDanielSaSalomeSiSimonTousTous

  Calendrier
  Taches
  Repas

AG, Daniel, Salome, Simon non connecte(s)ConnecterPrec.Avril 2026Suiv.LunMarMerJeuVenSamDim123456789101112131415161718192021222324252627282930Prochains evenementsAucun evenement+ Ajouter un evenement


const MEMBERS=[
  {id:'p1',name:'AG',initials:'AG',color:'#185FA5',bg:'#E6F1FB',tc:'#0C447C'},
  {id:'p2',name:'Daniel',initials:'Da',color:'#3B6D11',bg:'#EAF3DE',tc:'#27500A'},
  {id:'c1',name:'Salome',initials:'Sa',color:'#BA7517',bg:'#FAEEDA',tc:'#854F0B'},
  {id:'c2',name:'Simon',initials:'Si',color:'#993556',bg:'#FBEAF0',tc:'#72243E'},
];
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MONTHS=['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
const MEAL_DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MEAL_KEYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const now=new Date();
let viewYear=now.getFullYear(),viewMonth=now.getMonth();
let activeFilter=null,activeTab='cal';
let events=[],tasks=[],meals={},connected={};
const meals_default={Mon:['',''],Tue:['',''],Wed:['',''],Thu:['',''],Fri:['',''],Sat:['',''],Sun:['','']};
async function loadMembers(){
  try{const r=await fetch('/api/members');const data=await r.json();data.forEach(m=>{connected[m.id]=m.connected});}catch(e){}
  renderMembers();
}
async function loadEvents(){
  events=[];
  for(const m of MEMBERS){
    if(!connected[m.id]) continue;
    try{const r=await fetch('/api/events/'+m.id);const data=await r.json();events.push(...data);}catch(e){}
  }
  renderContent();
}
function getMember(id){return MEMBERS.find(m=>m.id===id)||MEMBERS[0]}
function renderMembers(){
  const el=document.getElementById('members');
  el.innerHTML=MEMBERS.map(m=>
    '<div class="member" onclick="toggleFilter(\''+m.id+'\')">'+
    '<div class="avatar '+(activeFilter===m.id?'active':'')+'" style="background:'+m.bg+';color:'+m.color+'">'+m.initials+
    '<div class="dot" style="background:'+(connected[m.id]?'#3B6D11':'#ccc')+'"></div></div>'+
    '<span>'+m.name+'</span></div>'
  ).join('')+
  '<div class="member" onclick="toggleFilter(null)">'+
  '<div class="avatar '+(activeFilter===null?'active':'')+'" style="background:#f0f0f0;color:#888;border-color:#ccc">Tous</div>'+
  '<span>Tous</span></div>';
}
function toggleFilter(id){activeFilter=activeFilter===id?null:id;renderMembers();renderContent()}
function switchTab(tab,el){
  activeTab=tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderContent();
}
function renderContent(){
  if(activeTab==='cal') renderCal();
  else if(activeTab==='tasks') renderTasks();
  else renderMeals();
}
function renderConnectBanner(){
  const disc=MEMBERS.filter(m=>!connected[m.id]);
  if(!disc.length) return '';
  return '<div class="connect-banner"><span>'+disc.map(m=>m.name).join(', ')+' non connecte(s)</span>'+
    '<button class="connect-btn" onclick="connectNext()">Connecter</button></div>';
}
function connectNext(){
  const m=MEMBERS.find(m=>!connected[m.id]);
  if(m) window.open('/auth/login?memberId='+m.id,'_blank','width=500,height=600');
  setTimeout(()=>{loadMembers();loadEvents();},3000);
}
function renderCal(){
  const c=document.getElementById('content');
  const firstDay=new Date(viewYear,viewMonth,1);
  const lastDay=new Date(viewYear,viewMonth+1,0);
  let startDow=(firstDay.getDay()+6)%7;
  const todayStr=now.toISOString().slice(0,10);
  const filtered=activeFilter?events.filter(e=>e.who===activeFilter):events;
  let days='';
  DAYS.forEach(d=>{days+='<div class="cal-head">'+d+'</div>'});
  for(let i=0;i<startDow;i++) days+='<div></div>';
  for(let d=1;d<=lastDay.getDate();d++){
    const ds=viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const de=filtered.filter(e=>e.date===ds);
    const isToday=ds===todayStr;
    const dots=de.map(e=>'<div class="dot" style="background:'+getMember(e.who).color+'"></div>').join('');
    days+='<div class="cal-day'+(isToday?' today':'')+'" onclick="openAddEvent(\''+ds+'\')">'+
      '<div class="day-num">'+d+'</div><div class="day-dots">'+dots+'</div></div>';
  }
  const upcoming=filtered.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  const evList=upcoming.map(e=>{
    const m=getMember(e.who);
    const label=new Date(e.date+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
    return '<div class="event-item"><div class="event-dot" style="background:'+m.color+'"></div>'+
      '<div><div class="event-title">'+e.title+'</div>'+
      '<div class="event-meta">'+label+(e.time?' · '+e.time:'')+' · '+m.name+'</div></div></div>';
  }).join('');
  c.innerHTML=renderConnectBanner()+
    '<div class="month-nav"><button onclick="changeMonth(-1)">Prec.</button>'+
    '<span>'+MONTHS[viewMonth]+' '+viewYear+'</span>'+
    '<button onclick="changeMonth(1)">Suiv.</button></div>'+
    '<div class="cal-grid">'+days+'</div>'+
    '<div class="events-list"><h3>Prochains evenements</h3>'+
    (evList||'<p style="font-size:13px;color:#aaa;font-style:italic">Aucun evenement</p>')+'</div>'+
    '<button class="add-btn" onclick="openAddEvent(\'\')">+ Ajouter un evenement</button>';
}
function changeMonth(d){
  viewMonth+=d;
  if(viewMonth>11){viewMonth=0;viewYear++;}
  if(viewMonth<0){viewMonth=11;viewYear--;}
  renderCal();
}
function openAddEvent(date){
  document.getElementById('modal-inner').innerHTML=
    '<h2>Nouvel evenement</h2>'+
    '<div class="form-row"><label>Titre</label><input id="ev-title"></div>'+
    '<div class="form-row"><label>Date</label><input id="ev-date" type="date" value="'+(date||now.toISOString().slice(0,10))+'"></div>'+
    '<div class="form-row"><label>Heure</label><input id="ev-time" type="time"></div>'+
    '<div class="form-row"><label>Qui</label><select id="ev-who">'+
    MEMBERS.map(m=>'<option value="'+m.id+'">'+m.name+'</option>').join('')+'</select></div>'+
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annuler</button>'+
    '<button class="btn-save" onclick="saveEvent()">Enregistrer</button></div>';
  document.getElementById('modal-bg').classList.add('open');
}
async function saveEvent(){
  const title=document.getElementById('ev-title').value.trim();
  const date=document.getElementById('ev-date').value;
  const time=document.getElementById('ev-time').value;
  const who=document.getElementById('ev-who').value;
  if(!title) return;
  try{
    const r=await fetch('/api/events/'+who,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date,time})});
    const ev=await r.json();events.push(ev);
  }catch(e){events.push({id:Date.now(),title,date,time,who});}
  closeModal();renderCal();
}
function closeModal(){document.getElementById('modal-bg').classList.remove('open')}
function renderTasks(){
  const c=document.getElementById('content');
  const filtered=activeFilter?tasks.filter(t=>t.who===activeFilter):tasks;
  const pending=filtered.filter(t=>!t.done);
  const done=filtered.filter(t=>t.done);
  const renderList=arr=>arr.map(t=>{
    const m=getMember(t.who);
    return '<div class="task-item"><div class="check'+(t.done?' done':'')+'" onclick="toggleTask('+t.id+')"></div>'+
      '<div class="task-text'+(t.done?' done':'')+'">'+t.title+'</div>'+
      '<span class="tag" style="background:'+m.bg+';color:'+m.tc+'">'+m.name+'</span></div>';
  }).join('');
  c.innerHTML='<div class="section-title">A faire ('+pending.length+')</div>'+
    (renderList(pending)||'<p style="font-size:13px;color:#aaa;font-style:italic">Tout est fait !</p>')+
    (done.length?'<div class="section-title">Termine</div>'+renderList(done):'')+
    '<button class="add-btn" onclick="openAddTask()">+ Ajouter une tache</button>';
}
function toggleTask(id){const t=tasks.find(t=>t.id===id);if(t)t.done=!t.done;renderTasks()}
function openAddTask(){
  document.getElementById('modal-inner').innerHTML=
    '<h2>Nouvelle tache</h2>'+
    '<div class="form-row"><label>Tache</label><input id="tk-title"></div>'+
    '<div class="form-row"><label>Assigne a</label><select id="tk-who">'+
    MEMBERS.map(m=>'<option value="'+m.id+'">'+m.name+'</option>').join('')+'</select></div>'+
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annuler</button>'+
    '<button class="btn-save" onclick="saveTask()">Enregistrer</button></div>';
  document.getElementById('modal-bg').classList.add('open');
}
function saveTask(){
  const title=document.getElementById('tk-title').value.trim();
  if(!title) return;
  tasks.push({id:Date.now(),title,who:document.getElementById('tk-who').value,done:false});
  closeModal();renderTasks();
}
function renderMeals(){
  const c=document.getElementById('content');
  const m=Object.assign({},meals_default,meals);
  let cols='';
  MEAL_KEYS.forEach((key,i)=>{
    const[lunch,dinner]=m[key]||['',''];
    cols+='<div class="week-col"><div class="week-head">'+MEAL_DAYS[i]+'</div>'+
      '<div class="meal-slot" onclick="editMeal(\''+key+'\',0)">'+
      '<div class="meal-label">Midi</div>'+
      (lunch?'<div class="meal-name">'+lunch+'</div>':'<div class="meal-empty">+</div>')+'</div>'+
      '<div class="meal-slot" onclick="editMeal(\''+key+'\',1)">'+
      '<div class="meal-label">Soir</div>'+
      (dinner?'<div class="meal-name">'+dinner+'</div>':'<div class="meal-empty">+</div>')+'</div></div>';
  });
  c.innerHTML='<div style="overflow-x:auto"><div class="week-grid" style="min-width:460px">'+cols+'</div></div>';
}
function editMeal(key,slot){
  const cur=(meals[key]||['',''])[slot];
  document.getElementById('modal-inner').innerHTML=
    '<h2>'+(slot===0?'Dejeuner':'Diner')+' - '+MEAL_DAYS[MEAL_KEYS.indexOf(key)]+'</h2>'+
    '<div class="form-row"><label>Repas</label><input id="meal-val" value="'+cur+'"></div>'+
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annuler</button>'+
    '<button class="btn-save" onclick="saveMeal(\''+key+'\','+slot+')">Enregistrer</button></div>';
  document.getElementById('modal-bg').classList.add('open');
}
function saveMeal(key,slot){
  if(!meals[key]) meals[key]=['',''];
  meals[key][slot]=document.getElementById('meal-val').value.trim();
  closeModal();renderMeals();
}
document.getElementById('today-label').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
document.getElementById('modal-bg').addEventListener('click',e=>{if(e.target===document.getElementById('modal-bg'))closeModal()});
loadMembers().then(()=>loadEvents());


`);
});

app.get('/auth/login', (req, res) => {
  const { memberId } = req.query;
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
    state: memberId
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state: memberId } = req.query;
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  const { tokens } = await client.getToken(code);
  if (!req.session.memberTokens) req.session.memberTokens = {};
  req.session.memberTokens[memberId] = tokens;
  res.send('Connexion reussie ! Vous pouvez fermer cet onglet.');
});

app.get('/api/members', (req, res) => {
  const connected = req.session.memberTokens || {};
  res.json(MEMBERS.map(m => ({ ...m, connected: !!connected[m.id] })));
});

app.get('/api/events/:memberId', async (req, res) => {
  const { memberId } = req.params;
  const tokens = req.session.memberTokens?.[memberId];
  if (!tokens) return res.json([]);
  try {
    const auth = getClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
      timeMax: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = response.data.items.map(e => ({
      id: e.id,
      title: e.summary,
      date: (e.start.date || e.start.dateTime || '').slice(0, 10),
      time: e.start.dateTime
        ? new Date(e.start.dateTime).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
        : '',
      who: memberId,
    }));
    res.json(events);
  } catch(e) { res.json([]); }
});

app.post('/api/events/:memberId', async (req, res) => {
  const { memberId } = req.params;
  const tokens = req.session.memberTokens?.[memberId];
  if (!tokens) return res.status(401).json({ error: 'Non connecte' });
  const { title, date, time } = req.body;
  try {
    const auth = getClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    const start = time ? { dateTime: date+'T'+time+':00', timeZone: 'Europe/Paris' } : { date };
    const end = time ? { dateTime: date+'T'+time+':00', timeZone: 'Europe/Paris' } : { date };
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: { summary: title, start, end },
    });
    res.json({ id: event.data.id, title, date, time, who: memberId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/events/:memberId/:eventId', async (req, res) => {
  const { memberId, eventId } = req.params;
  const tokens = req.session.memberTokens?.[memberId];
  if (!tokens) return res.status(401).json({ error: 'Non connecte' });
  try {
    const auth = getClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({ calendarId: 'primary', eventId });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => console.log('Serveur demarre sur http://localhost:3000'));