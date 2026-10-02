const express = require('express');
const { readStore, writeStore } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const { validateSettings } = require('../middleware/validation');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
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

router.put('/', verifyToken, (req, res, next) => {
  try {
    const validatedSettings = validateSettings(req.body);
    const store = readStore();
    
    store.settings = {
      ...store.settings,
      ...validatedSettings
    };
    
    writeStore(store);
    
    res.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: store.settings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
