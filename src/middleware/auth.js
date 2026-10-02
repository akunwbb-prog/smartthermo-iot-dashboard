const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.smartthermo_token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan',
      code: 'NO_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('smartthermo_token');
      return res.status(401).json({
        success: false,
        message: 'Session telah berakhir',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      code: 'INVALID_TOKEN'
    });
  }
}

function verifyIoTKey(req, res, next) {
  const apiKey = req.get('x-api-key');
  
  if (!apiKey || apiKey !== process.env.IOT_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'API key tidak valid',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
}

module.exports = {
  verifyToken,
  verifyIoTKey
};
