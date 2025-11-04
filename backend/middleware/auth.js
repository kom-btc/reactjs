// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));

// ========================
// Auth Middleware
// ========================
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ບໍ່ພົບ token, ກະລຸນາເຂົ້າສູ່ລະບົບ'
      });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    
    req.user = {
      id: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };
    
    console.log('🔓 Auth passed for user:', req.user);
    
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ'
    });
  }
};

// ========================
// Admin Flag Middleware
// ========================
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    console.log('⛔ Admin flag access denied for:', req.user?.username);
    return res.status(403).json({
      success: false,
      message: 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຟັງຊັນນີ້ (ຕ້ອງການສິດ Admin)'
    });
  }
  console.log('✅ Admin flag access granted for:', req.user.username);
  next();
};

// ========================
// Admin Group Middleware
// ========================
const isAdminGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userGroup = await dbGet(
      `SELECT ug.*, g.name as group_name
       FROM user_groups ug
       INNER JOIN groups g ON ug.group_id = g.id
       WHERE ug.user_id = ? AND LOWER(g.name) = 'admin'`,
      [userId]
    );

    if (!userGroup) {
      console.log('⛔ Admin group access denied for:', req.user.username);
      return res.status(403).json({
        success: false,
        message: 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຟັງຊັນນີ້ (ຕ້ອງການສິດ Admin Group)'
      });
    }

    console.log('✅ Admin group access granted for:', req.user.username);
    req.user.adminGroup = userGroup;
    next();
  } catch (error) {
    console.error('❌ Check admin group error:', error);
    return res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບສິດ'
    });
  }
};

// ========================
// Admin OR Admin Group Middleware
// ========================
const isAdminOrAdminGroup = async (req, res, next) => {
  try {
    // ຖ້າມີ is_admin flag, ຜ່ານເລີຍ
    if (req.user && req.user.isAdmin) {
      console.log('✅ Admin flag access granted for:', req.user.username);
      return next();
    }

    // ບໍ່ງັ້ນກວດສອບ admin group
    const userId = req.user.id;
    const userGroup = await dbGet(
      `SELECT ug.*, g.name as group_name
       FROM user_groups ug
       INNER JOIN groups g ON ug.group_id = g.id
       WHERE ug.user_id = ? AND LOWER(g.name) = 'admin'`,
      [userId]
    );

    if (!userGroup) {
      console.log('⛔ Admin access denied for:', req.user.username);
      return res.status(403).json({
        success: false,
        message: 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຟັງຊັນນີ້ (ຕ້ອງການສິດ Admin)'
      });
    }

    console.log('✅ Admin group access granted for:', req.user.username);
    req.user.adminGroup = userGroup;
    next();
  } catch (error) {
    console.error('❌ Check admin access error:', error);
    return res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບສິດ'
    });
  }
};

// ========================
// EXPORTS
// ========================
module.exports = {
  authMiddleware,
  isAdmin,
  isAdminGroup,
  isAdminOrAdminGroup
};