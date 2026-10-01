const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const file = path.resolve(process.env.DATA_FILE || './data/store.json');
const defaults = {
  settings: { roomFanOn: 30, machineFanOn: 60, danger: 80 },
  latest: { temp_mesin: 0, temp_ruangan: 0, hum_ruangan: 0, kipas_ruangan: 0, kipas_mesin: 0, buzzer: 0, modbus_status: 'DISCONNECTED', received_at: null },
  history: [],
  users: []
};
function ensure() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(defaults, null, 2));
}
function read() { ensure(); const data = JSON.parse(fs.readFileSync(file, 'utf8')); return { ...defaults, ...data }; }
function write(data) { ensure(); const tmp = `${file}.tmp`; fs.writeFileSync(tmp, JSON.stringify(data, null, 2)); fs.renameSync(tmp, file); }
function init() {
  const data = read();
  if (!data.users.length) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'change-me-now';
    data.users.push({ username, passwordHash: bcrypt.hashSync(password, 12), role: 'admin' });
    write(data);
    if (password === 'change-me-now') console.warn('WARNING: Set ADMIN_PASSWORD in .env before production use.');
  }
}
function get() { return read(); }
function addReading(reading) { const data = read(); data.latest = reading; data.history.unshift(reading); data.history = data.history.slice(0, 10000); write(data); return reading; }
function updateSettings(settings) { const data = read(); data.settings = { ...data.settings, ...settings }; write(data); return data.settings; }
init();
module.exports = { get, addReading, updateSettings, findUser: username => get().users.find(u => u.username === username) };
