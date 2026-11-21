/**
 * OpportunityTracker — demo login backend
 *
 *   npm install
 *   npm start            → http://localhost:3000
 *
 * What it does
 *   • Serves the website (index.html, css/, js/, …) from this folder.
 *   • POST /api/auth/login   checks email + password against data/users.json (bcrypt hashes)
 *   • GET  /api/auth/me      returns the signed-in user (or 401)
 *   • POST /api/auth/logout  signs out
 *   • GET  /logout           signs out and goes back to the login page
 *   • Every .html page except login.html / intro.html needs a valid login,
 *     otherwise the visitor is sent to /login.html.
 *
 * Sessions are a signed JWT in an httpOnly cookie, so page scripts can't read it.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const USERS_FILE = path.join(ROOT, 'data', 'users.json');
const COOKIE = 'ot_session';
const IS_PROD = process.env.NODE_ENV === 'production';

// Use JWT_SECRET from .env; otherwise make a random one (everyone is signed out on restart).
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠  JWT_SECRET not set: using a random secret. Logins will reset when the server restarts.');
}

// Pages anyone can open without signing in
const PUBLIC_PAGES = new Set(['/login.html', '/intro.html']);

// Files in this folder that must never be served to the browser
const BLOCKED = /^\/(server\.js|package(-lock)?\.json|render\.yaml|scripts(\/|$)|data(\/|$)|node_modules(\/|$)|\.env|README\.md)/i;

// ───────────────────────── helpers ─────────────────────────
function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, department: u.department };
}

function readSession(req) {
  const token = req.cookies[COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Simple in-memory limiter: 5 failed logins per IP per 15 minutes
const failures = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
function tooManyFailures(ip) {
  const now = Date.now();
  const list = (failures.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  failures.set(ip, list);
  return list.length >= MAX_FAILS;
}
function recordFailure(ip) {
  const list = failures.get(ip) || [];
  list.push(Date.now());
  failures.set(ip, list);
}

// ───────────────────────── app ─────────────────────────
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render (and most hosts) sit behind a proxy: needed for HTTPS cookies and per-visitor rate limits

// Health check for the host
app.get('/healthz', (req, res) => res.send('ok'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// API ─────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip;
  if (tooManyFailures(ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const remember = Boolean(req.body?.remember);
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = loadUsers().find((u) => u.email.toLowerCase() === email);
  // Always run bcrypt so a wrong email and a wrong password take the same time
  const hash = user ? user.passwordHash : '$2a$10$Ts53fpa6W.9sztl22Od6k.XAf78DfAI088.5C/p88bK.w7iaEyhEC';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) {
    recordFailure(ip);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  failures.delete(ip);
  const maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 7 days or 8 hours
  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: Math.floor(maxAge / 1000),
  });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    path: '/',
    ...(remember ? { maxAge } : {}), // without "remember me" it's a browser-session cookie
  });
  res.json({ user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const s = readSession(req);
  if (!s) return res.status(401).json({ error: 'Not signed in.' });
  const user = loadUsers().find((u) => u.id === s.sub);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.get('/logout', (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.redirect('/login.html');
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Pages ───────────────────────────────────
app.use((req, res, next) => {
  if (BLOCKED.test(req.path)) return res.status(404).send('Not found');

  const isPage = req.path === '/' || req.path.endsWith('.html');
  if (!isPage || PUBLIC_PAGES.has(req.path)) return next();

  if (!readSession(req)) return res.redirect('/login.html');
  next();
});

app.use(express.static(ROOT, { index: 'index.html', dotfiles: 'deny', extensions: ['html'] }));

app.listen(PORT, () => {
  console.log(`\n  OpportunityTracker running →  http://localhost:${PORT}/login.html\n`);
  console.log('  Demo login:  coordinator@demo.edu  /  demo123\n');
});
