const express = require('express');
const { readStore } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  try {
    const store = readStore();
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 1000);
    const from = req.query.from ? new Date(req.query.from).getTime() : 0;
    const to = req.query.to ? new Date(req.query.to).getTime() + 86400000 : Infinity;
    
    const filtered = store.history.filter(row => {
      const timestamp = new Date(row.received_at).getTime();
      return timestamp >= from && timestamp <= to;
    });
    
    const rows = filtered.slice(0, limit);
    
    res.json({
      success: true,
      data: {
        rows: rows,
        total: filtered.length,
        limit: limit,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat',
      code: 'FETCH_HISTORY_ERROR'
    });
  }
});

router.get('/export', verifyToken, (req, res) => {
  try {
    const store = readStore();
    
    const csv = [
      ['Waktu', 'Suhu Mesin (°C)', 'Suhu Ruangan (°C)', 'Kelembaban (%)', 'Kipas Ruangan', 'Kipas Mesin', 'Buzzer', 'Status Modbus'].join(',')
    ];
    
    store.history.forEach(row => {
      csv.push([
        row.received_at,
        Number(row.temp_mesin || 0).toFixed(2),
        Number(row.temp_ruangan || 0).toFixed(2),
        Number(row.hum_ruangan || 0).toFixed(2),
        row.kipas_ruangan === 1 ? 'ON' : 'OFF',
        row.kipas_mesin === 1 ? 'ON' : 'OFF',
        row.buzzer === 1 ? 'ACTIVE' : 'MUTE',
        row.modbus_status || 'OK'
      ].join(','));
    });
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="smartthermo-export.csv"'
    });
    res.send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal export data',
      code: 'EXPORT_ERROR'
    });
  }
});

module.exports = router;
