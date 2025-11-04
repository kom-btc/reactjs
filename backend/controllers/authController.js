// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const jwtConfig = require('../config/jwt');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

// ========================
// LOGIN
// ========================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ' 
      });
    }

    // Get user
    const user = await dbGet(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );

    if (!user) {
      await logFailedLogin(username, req);
      return res.status(401).json({ 
        success: false, 
        message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await logFailedLogin(username, req);
      return res.status(401).json({ 
        success: false, 
        message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' 
      });
    }

    // Get user menus
    let menus;
    if (user.is_admin === 1) {
      menus = await dbAll(
        'SELECT * FROM menus WHERE is_active = 1 ORDER BY order_index'
      );
    } else {
      menus = await dbAll(
        `SELECT DISTINCT m.id, m.name, m.path, m.icon, m.order_index, m.parent_id, m.is_active
         FROM menus m
         INNER JOIN group_permissions gp ON m.id = gp.menu_id
         INNER JOIN user_groups ug ON gp.group_id = ug.group_id
         WHERE ug.user_id = ? 
         AND m.is_active = 1 
         AND gp.can_view = 1
         ORDER BY m.order_index`,
        [user.id]
      );
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1
    };
    
    console.log('🔐 Creating token for user:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const expiresIn = 8 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresIn);

    // Log successful login
    await logSuccessfulLogin(user.id, user.username, req);

    console.log(`✅ Login successful: ${user.username} (${menus.length} menus)`);

    res.json({
      success: true,
      message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ',
      data: {
        token,
        expiresAt: expiresAt.toISOString(),
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          isAdmin: user.is_admin === 1
        },
        menus
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ' 
    });
  }
};

// ========================
// GET PROFILE
// ========================
const getProfile = async (req, res) => {
  try {
    console.log('👤 Get profile for user:', req.user);
    
    const user = await dbGet(
      'SELECT id, username, full_name, email, is_admin, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້' 
      });
    }

    const groups = await dbAll(
      `SELECT g.* FROM groups g
       INNER JOIN user_groups ug ON g.id = ug.group_id
       WHERE ug.user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { ...user, groups }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

// ========================
// GET USER MENUS
// ========================
const getUserMenus = async (req, res) => {
  try {
    console.log('📋 Get menus for user:', req.user);
    
    const userId = req.user.id;
    let menus;

    if (req.user.isAdmin) {
      menus = await dbAll(
        'SELECT * FROM menus WHERE is_active = 1 ORDER BY order_index'
      );
    } else {
      menus = await dbAll(
        `SELECT DISTINCT m.id, m.name, m.path, m.icon, m.order_index, m.parent_id, m.is_active
         FROM menus m
         INNER JOIN group_permissions gp ON m.id = gp.menu_id
         INNER JOIN user_groups ug ON gp.group_id = ug.group_id
         WHERE ug.user_id = ? 
         AND m.is_active = 1 
         AND gp.can_view = 1
         ORDER BY m.order_index`,
        [userId]
      );
    }

    res.json({
      success: true,
      data: menus
    });

  } catch (error) {
    console.error('❌ Get user menus error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນເມນູ' 
    });
  }
};

// ========================
// CHANGE PASSWORD
// ========================
const changePassword = async (req, res) => {
  try {
    console.log('🔑 Change password for user:', req.user);
    
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບຖ້ວນ'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'ລະຫັດຜ່ານໃໝ່ແລະຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງບໍ່ຄືກັບລະຫັດຜ່ານເກົ່າ'
      });
    }

    const user = await dbGet(
      'SELECT id, username, password, email, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      await logFailedPasswordChange(userId, user.username, req);
      return res.status(401).json({
        success: false,
        message: 'ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log(`✅ Password changed successfully for user: ${user.username}`);

    res.json({
      success: true,
      message: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ'
    });
  }
};

// ========================
// HELPER FUNCTIONS
// ========================

// ບັນທຶກການ login ສຳເລັດ
const logSuccessfulLogin = async (userId, username, req) => {
  try {
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        'LOGIN',
        'AUTH',
        userId,
        req.ip || req.connection?.remoteAddress || '::1',
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify({ 
          success: true,
          timestamp: new Date().toISOString()
        })
      ]
    );
    console.log(`✅ Login logged for: ${username}`);
  } catch (error) {
    console.error('❌ Error logging successful login:', error);
  }
};

// ບັນທຶກການ login ລົ້ມເຫຼວ
const logFailedLogin = async (username, req) => {
  try {
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,
        username || 'unknown',
        'LOGIN_FAILED',
        'AUTH',
        null,
        req.ip || req.connection?.remoteAddress || '::1',
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify({ 
          reason: 'Invalid credentials',
          timestamp: new Date().toISOString()
        })
      ]
    );
    console.log(`⚠️ Failed login attempt for: ${username || 'unknown'}`);
  } catch (error) {
    console.error('❌ Error logging failed login:', error);
  }
};

// ບັນທຶກການປ່ຽນລະຫັດຜ່ານລົ້ມເຫຼວ
const logFailedPasswordChange = async (userId, username, req) => {
  try {
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        'CHANGE_PASSWORD_FAILED',
        'AUTH',
        userId,
        req.ip || req.connection?.remoteAddress || '::1',
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify({ 
          reason: 'Invalid current password',
          timestamp: new Date().toISOString()
        })
      ]
    );
    console.log(`⚠️ Failed password change for: ${username}`);
  } catch (error) {
    console.error('❌ Error logging failed password change:', error);
  }
};

// ========================
// EXPORTS
// ========================
module.exports = {
  login,
  getProfile,
  getUserMenus,
  changePassword
};