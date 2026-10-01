const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('./src/store');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';
const IOT_API_KEY = process.env.IOT_API_KEY || 'development-iot-key';
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('tiny'));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function auth(req, res, next) {
  const token = req.cookies.smartthermo_token;
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Autentikasi diperlukan.' }); }
}
function number(value, name, min = -100, max = 250) {
  const n = Number(value); if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} tidak valid`); return n;
}

app.post('/api/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = store.findUser(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Username atau password salah.' });
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.cookie('smartthermo_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 });
  res.json({ ok: true, user: { username: user.username, role: user.role } });
});
app.post('/api/logout', (req, res) => { res.clearCookie('smartthermo_token'); res.json({ ok: true }); });
app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));
app.get('/api/status', auth, (req, res) => { const data = store.get(); res.json({ latest: data.latest, settings: data.settings }); });
app.get('/api/history', auth, (req, res) => {
  const data = store.get(); const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
  const from = req.query.from ? new Date(req.query.from).getTime() : 0;
  const to = req.query.to ? new Date(req.query.to).getTime() + 86400000 : Infinity;
  res.json({ rows: data.history.filter(x => { const t = new Date(x.received_at).getTime(); return t >= from && t <= to; }).slice(0, limit) });
});
app.put('/api/settings', auth, (req, res) => {
  try { const settings = { roomFanOn: number(req.body.roomFanOn, 'roomFanOn', 0, 100), machineFanOn: number(req.body.machineFanOn, 'machineFanOn', 0, 250), danger: number(req.body.danger, 'danger', 0, 250) }; res.json({ settings: store.updateSettings(settings) }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.post('/api/update-data', (req, res) => {
  if (req.get('x-api-key') !== IOT_API_KEY) return res.status(401).json({ error: 'API key IoT tidak valid.' });
  try {
    const b = req.body; const reading = { temp_mesin: number(b.temp_mesin, 'temp_mesin'), temp_ruangan: number(b.temp_ruangan, 'temp_ruangan'), hum_ruangan: number(b.hum_ruangan, 'hum_ruangan', 0, 100), kipas_ruangan: b.kipas_ruangan ? 1 : 0, kipas_mesin: b.kipas_mesin ? 1 : 0, buzzer: b.buzzer ? 1 : 0, modbus_status: String(b.modbus_status || 'UNKNOWN').slice(0, 30), received_at: new Date().toISOString() };
    store.addReading(reading); res.status(201).json({ ok: true, received_at: reading.received_at, settings: store.get().settings });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`SmartThermo berjalan di http://localhost:${PORT}`));
