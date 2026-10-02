const express = require('express');
const { readStore, writeStore } = require('../config/database');
const { verifyIoTKey } = require('../middleware/auth');
const { validateSensorReading } = require('../middleware/validation');

const router = express.Router();

router.post('/readings', verifyIoTKey, (req, res, next) => {
  try {
    const reading = validateSensorReading(req.body);
    const store = readStore();
    
    store.latest = reading;
    store.history.unshift(reading);
    store.history = store.history.slice(0, 5000);
    
    writeStore(store);
    
    res.status(201).json({
      success: true,
      message: 'Data sensor diterima',
      data: {
        received_at: reading.received_at,
        settings: store.settings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', verifyIoTKey, (req, res) => {
  try {
    const store = readStore();
    res.json({
      success: true,
      data: store.latest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data terbaru',
      code: 'FETCH_LATEST_ERROR'
    });
  }
});

router.get('/settings', verifyIoTKey, (req, res) => {
  try {
    const store = readStore();
    res.json({
      success: true,
      data: store.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan',
      code: 'FETCH_SETTINGS_ERROR'
    });
  }
});

module.exports = router;
