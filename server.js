require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

const MEMBERS = [
  { id: 'p1', name: 'AG',     color: '#185FA5' },
  { id: 'p2', name: 'Daniel', color: '#3B6D11' },
  { id: 'c1', name: 'Salomé', color: '#BA7517' },
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

// Auth routes
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
  res.send(`window.close()Connecté ! Vous pouvez fermer cet onglet.`);
});

// Récupérer les événements Google Calendar d'un membre
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
  } catch(e) {
    res.json([]);
  }
});

// Ajouter un événement dans Google Calendar
app.post('/api/events/:memberId', async (req, res) => {
  const { memberId } = req.params;
  const tokens = req.session.memberTokens?.[memberId];
  if (!tokens) return res.status(401).json({ error: 'Non connecté' });
  const { title, date, time } = req.body;
  try {
    const auth = getClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    const start = time
      ? { dateTime: `${date}T${time}:00`, timeZone: 'Europe/Paris' }
      : { date };
    const end = time
      ? { dateTime: `${date}T${time}:00`, timeZone: 'Europe/Paris' }
      : { date };
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: { summary: title, start, end },
    });
    res.json({ id: event.data.id, title, date, time, who: memberId });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Supprimer un événement
app.delete('/api/events/:memberId/:eventId', async (req, res) => {
  const { memberId, eventId } = req.params;
  const tokens = req.session.memberTokens?.[memberId];
  if (!tokens) return res.status(401).json({ error: 'Non connecté' });
  try {
    const auth = getClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({ calendarId: 'primary', eventId });
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/members', (req, res) => {
  const connected = req.session.memberTokens || {};
  res.json(MEMBERS.map(m => ({
    ...m,
    connected: !!connected[m.id]
  })));
});

app.listen(3000, () =>
  console.log('Serveur démarré sur http://localhost:3000')
);