const validator = require('validator');

function validateNumber(value, label, min = -100, max = 250) {
  const num = Number(value);
  
  if (!Number.isFinite(num)) {
    const error = new Error(`${label} harus berupa angka`);
    error.statusCode = 400;
    throw error;
  }
  
  if (num < min || num > max) {
    const error = new Error(`${label} harus antara ${min} dan ${max}`);
    error.statusCode = 400;
    throw error;
  }
  
  return num;
}

function validateSensorReading(payload) {
  const reading = {
    temp_mesin: validateNumber(payload.temp_mesin, 'Suhu mesin', -50, 180),
    temp_ruangan: validateNumber(payload.temp_ruangan, 'Suhu ruangan', -50, 120),
    hum_ruangan: validateNumber(payload.hum_ruangan, 'Kelembaban ruangan', 0, 100),
    kipas_ruangan: Number(payload.kipas_ruangan) === 1 ? 1 : 0,
    kipas_mesin: Number(payload.kipas_mesin) === 1 ? 1 : 0,
    buzzer: Number(payload.buzzer) === 1 ? 1 : 0,
    modbus_status: String(payload.modbus_status || 'OK').toUpperCase(),
    received_at: new Date().toISOString()
  };
  
  return reading;
}

function validateLoginInput(username, password) {
  if (!username || typeof username !== 'string') {
    const error = new Error('Username diperlukan');
    error.statusCode = 400;
    throw error;
  }
  
  if (!password || typeof password !== 'string') {
    const error = new Error('Password diperlukan');
    error.statusCode = 400;
    throw error;
  }
  
  if (username.length < 3 || username.length > 50) {
    const error = new Error('Username harus 3-50 karakter');
    error.statusCode = 400;
    throw error;
  }
  
  return { username: username.trim(), password };
}

function validateSettings(payload) {
  return {
    roomFanThreshold: validateNumber(payload.roomFanThreshold, 'Room fan threshold', 0, 100),
    machineFanThreshold: validateNumber(payload.machineFanThreshold, 'Machine fan threshold', 0, 150),
    alarmThreshold: validateNumber(payload.alarmThreshold, 'Alarm threshold', 0, 150),
    autoControl: typeof payload.autoControl === 'boolean' ? payload.autoControl : true
  };
}

module.exports = {
  validateNumber,
  validateSensorReading,
  validateLoginInput,
  validateSettings
};
