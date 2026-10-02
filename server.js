const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'smartthermo-dev-secret';
const IOT_API_KEY = process.env.IOT_API_KEY || 'smartthermo-iot-key';
const DATA_FILE = path.resolve(process.env.DATA_FILE || path.join(__dirname, 'data', 'store.json'));

const defaultState = {
  settings: {
    roomFanThreshold: 30,
    machineFanThreshold: 60,
    alarmThreshold: 80,
    roomFanLabel: 'OFF',
    machineFanLabel: 'OFF',
    buzzerLabel: 'MUTE'
  },
  latest: {
    temp_mesin: 0,
    temp_ruangan: 0,
    hum_ruangan: 0,
    kipas_ruangan: 0,
    kipas_mesin: 0,
    buzzer: 0,
    modbus_status: 'DISCONNECTED',
    received_at: null
  },
  history: [],
  users: []
};

function ensureDataDir() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

function readState() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      latest: { ...defaultState.latest, ...(parsed.latest || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      users: Array.isArray(parsed.users) ? parsed.users : []
    };
  } catch (error) {
    console.error('Gagal membaca store data. Membuat ulang store default...');
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
    return structuredClone(defaultState);
  }
}

function writeState(state) {
  ensureDataDir();
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function ensureAdminUser() {
  const state = readState();
  if (!state.users.length) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    state.users.push({
      username,
      passwordHash: bcrypt.hashSync(password, 12),
      role: 'admin'
    });
    writeState(state);

    if (password === 'admin123') {
      console.warn('WARNING: Gunakan password yang aman di file .env sebelum deploy production.');
    }
  }
}

function auth(req, res, next) {
  const token = req.cookies.smartthermo_token;
  if (!token) {
    return res.status(401).json({ error: 'Autentikasi diperlukan.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa.' });
  }
}

function parseNumber(value, label, min = -100, max = 250) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new Error(`${label} tidak valid.`);
  }
  return num;
}

function normalizeReading(payload) {
  const reading = {
    temp_mesin: parseNumber(payload.temp_mesin, 'temp_mesin', -50, 180),
    temp_ruangan: parseNumber(payload.temp_ruangan, 'temp_ruangan', -50, 120),
    hum_ruangan: parseNumber(payload.hum_ruangan, 'hum_ruangan', 0, 100),
    kipas_ruangan: Number(payload.kipas_ruangan) === 1 ? 1 : 0,
    kipas_mesin: Number(payload.kipas_mesin) === 1 ? 1 : 0,
    buzzer: Number(payload.buzzer) === 1 ? 1 : 0,
    modbus_status: String(payload.modbus_status || 'OK').toUpperCase(),
    received_at: new Date().toISOString()
  };

  return reading;
}

function getReadableStatus(value) {
  return value === 1 || value === '1' ? 'ON' : 'OFF';
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('tiny'));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const state = readState();
  const user = state.users.find((item) => item.username === username);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

  res.cookie('smartthermo_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });

  return res.json({ ok: true, user: { username: user.username, role: user.role } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('smartthermo_token');
  return res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => {
  return res.json({ user: req.user });
});

app.get('/api/status', auth, (req, res) => {
  const state = readState();
  return res.json({ latest: state.latest, settings: state.settings });
});

app.get('/api/history', auth, (req, res) => {
  const state = readState();
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
  const from = req.query.from ? new Date(req.query.from).getTime() : 0;
  const to = req.query.to ? new Date(req.query.to).getTime() + 86400000 : Infinity;

  const rows = state.history
    .filter((row) => {
      const ts = new Date(row.received_at).getTime();
      return ts >= from && ts <= to;
    })
    .slice(0, limit);

  return res.json({ rows });
});

app.put('/api/settings', auth, (req, res) => {
  try {
    const state = readState();
    const payload = req.body || {};

    state.settings = {
      ...state.settings,
      roomFanThreshold: parseNumber(payload.roomFanThreshold ?? state.settings.roomFanThreshold, 'roomFanThreshold', 0, 100),
      machineFanThreshold: parseNumber(payload.machineFanThreshold ?? state.settings.machineFanThreshold, 'machineFanThreshold', 0, 150),
      alarmThreshold: parseNumber(payload.alarmThreshold ?? state.settings.alarmThreshold, 'alarmThreshold', 0, 150)
    };

    writeState(state);
    return res.json({ ok: true, settings: state.settings });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/update-data', (req, res) => {
  const apiKey = req.get('x-api-key');
  if (apiKey !== IOT_API_KEY) {
    return res.status(401).json({ error: 'API key IoT tidak valid.' });
  }

  try {
    const reading = normalizeReading(req.body || {});
    const state = readState();

    state.latest = {
      ...reading,
      kipas_ruangan_status: getReadableStatus(reading.kipas_ruangan),
      kipas_mesin_status: getReadableStatus(reading.kipas_mesin),
      buzzer_status: getReadableStatus(reading.buzzer)
    };

    state.history.unshift({ ...reading, status: 'received' });
    state.history = state.history.slice(0, 2000);
    state.settings.roomFanLabel = reading.kipas_ruangan === 1 ? 'ON' : 'OFF';
    state.settings.machineFanLabel = reading.kipas_mesin === 1 ? 'ON' : 'OFF';
    state.settings.buzzerLabel = reading.buzzer === 1 ? 'ACTIVE' : 'MUTE';

    writeState(state);
    return res.status(201).json({ ok: true, received_at: reading.received_at, settings: state.settings });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureAdminUser();

app.listen(PORT, () => {
  console.log(`SmartThermo berjalan di http://localhost:${PORT}`);
});

module.exports = app;
