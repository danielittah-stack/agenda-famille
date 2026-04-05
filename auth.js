require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

app.get('/auth/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);
  req.session.tokens = tokens;
  res.send('Connexion réussie ! Vous pouvez fermer cet onglet.');
});

app.get('/', (req, res) => {
  const connected = !!req.session.tokens;
  res.send(connected
    ? 'Connecté ! <a href="/auth/logout">Se déconnecter</a>'
    : '<a href="/auth/login">Se connecter avec Google</a>'
  );
});

app.listen(3000, () =>
  console.log('Serveur démarré sur http://localhost:3000')
);