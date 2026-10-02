const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const defaultStore = {
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
  settings: {
    roomFanThreshold: 30,
    machineFanThreshold: 60,
    alarmThreshold: 80,
    autoControl: true
  }
};

const defaultUsers = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    writeStore(defaultStore);
  }
  try {
    const data = fs.readFileSync(STORE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading store:', err.message);
    return defaultStore;
  }
}

function writeStore(data) {
  ensureDataDir();
  try {
    const tmpFile = `${STORE_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    fs.renameSync(tmpFile, STORE_FILE);
  } catch (err) {
    console.error('Error writing store:', err.message);
  }
}

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    writeUsers(defaultUsers);
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users:', err.message);
    return defaultUsers;
  }
}

function writeUsers(users) {
  ensureDataDir();
  try {
    const tmpFile = `${USERS_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2));
    fs.renameSync(tmpFile, USERS_FILE);
  } catch (err) {
    console.error('Error writing users:', err.message);
  }
}

function initializeDataStore() {
  ensureDataDir();
  const users = readUsers();
  
  if (users.length === 0) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SmartThermo2024!';
    
    const adminUser = {
      id: '1',
      username: adminUsername,
      email: 'admin@smartthermo.local',
      passwordHash: bcrypt.hashSync(adminPassword, 12),
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    writeUsers([adminUser]);
    console.log('✓ Admin user initialized');
  }
  
  if (!fs.existsSync(STORE_FILE)) {
    writeStore(defaultStore);
    console.log('✓ Data store initialized');
  }
}

module.exports = {
  readStore,
  writeStore,
  readUsers,
  writeUsers,
  initializeDataStore,
  DATA_DIR,
  STORE_FILE,
  USERS_FILE
};
