const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readUsers } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const { validateLoginInput } = require('../middleware/validation');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = validateLoginInput(req.body.username, req.body.password);
    
    const users = readUsers();
    const user = users.find(u => u.username === username && u.isActive);
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '8h' }
    );
    
    res.cookie('smartthermo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('smartthermo_token');
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.post('/refresh', verifyToken, (req, res) => {
  const token = jwt.sign(
    {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '8h' }
  );
  
  res.cookie('smartthermo_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  });
  
  res.json({
    success: true,
    message: 'Token diperbarui'
  });
});

module.exports = router;
