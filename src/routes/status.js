const express = require('express');
const { readStore } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  try {
    const store = readStore();
    
    res.json({
      success: true,
      data: {
        latest: store.latest,
        settings: store.settings,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil status',
      code: 'FETCH_STATUS_ERROR'
    });
  }
});

module.exports = router;
