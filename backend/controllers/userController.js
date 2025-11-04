const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Reset Password ໂດຍ Admin
const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const adminId = req.user.id;
    const adminUsername = req.user.username;

    // ກວດສອບວ່າ user ທີ່ເຮັດການ reset ເປັນ admin ບໍ່
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'ທ່ານບໍ່ມີສິດໃນການ reset ລະຫັດຜ່ານ'
      });
    }

    // Validation
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'ກະລຸນາໃສ່ລະຫັດຜ່ານໃໝ່'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'
      });
    }

    // ກວດສອບວ່າມີ user ນີ້ຢູ່ບໍ່
    const user = await dbGet(
      'SELECT id, username, email, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
      });
    }

    // ກວດສອບວ່າ admin ບໍ່ສາມາດ reset password ຂອງຕົວເອງໄດ້ (ບັງຄັບໃຫ້ໃຊ້ change password)
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        message: 'ບໍ່ສາມາດ reset ລະຫັດຜ່ານຂອງຕົວເອງໄດ້, ກະລຸນາໃຊ້ຟັງຊັນປ່ຽນລະຫັດຜ່ານ'
      });
    }

    // Hash password ໃໝ່
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ອັບເດດ password
    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    // ບັນທຶກ audit log
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        adminUsername,
        'RESET_PASSWORD',
        'users',
        userId,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify({
          targetUser: user.username,
          targetUserId: userId,
          resetBy: adminUsername
        })
      ]
    );

    res.json({
      success: true,
      message: `ປ່ຽນລະຫັດຜ່ານຂອງ ${user.username} ສຳເລັດແລ້ວ`
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການ reset ລະຫັດຜ່ານ'
    });
  }
};

// ສ້າງ Temporary Password ແບບສຸ່ມ
const generateTempPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;
    const adminUsername = req.user.username;

    // ກວດສອບວ່າເປັນ admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'ທ່ານບໍ່ມີສິດໃນການສ້າງລະຫັດຜ່ານຊົ່ວຄາວ'
      });
    }

    // ກວດສອບວ່າມີ user ນີ້ຢູ່ບໍ່
    const user = await dbGet(
      'SELECT id, username, email, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
      });
    }

    // ກວດສອບວ່າບໍ່ແມ່ນຕົວເອງ
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        message: 'ບໍ່ສາມາດສ້າງລະຫັດຜ່ານຊົ່ວຄາວໃຫ້ຕົວເອງໄດ້'
      });
    }

    // สร้າง temporary password (8 ຕົວອັກສອນ)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ອັບເດດ password
    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    // ບັນທຶກ audit log
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        adminUsername,
        'GENERATE_TEMP_PASSWORD',
        'users',
        userId,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify({
          targetUser: user.username,
          targetUserId: userId,
          generatedBy: adminUsername
        })
      ]
    );

    res.json({
      success: true,
      message: 'ສ້າງລະຫັດຜ່ານຊົ່ວຄາວສຳເລັດແລ້ວ',
      data: {
        username: user.username,
        tempPassword: tempPassword,
        note: 'ກະລຸນາບອກລະຫັດຜ່ານນີ້ໃຫ້ຜູ້ໃຊ້ ແລະ ແນະນຳໃຫ້ປ່ຽນທັນທີ'
      }
    });

  } catch (error) {
    console.error('Generate temp password error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງລະຫັດຜ່ານຊົ່ວຄາວ'
    });
  }
};

// ບໍ່ໃຊ້ promisify ສຳລັບ db.run ເພາະວ່າຕ້ອງການ lastID
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, username, full_name, email, is_active, is_admin, created_at, updated_at 
       FROM users ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await dbGet(
      `SELECT id, username, full_name, email, is_active, is_admin, created_at, updated_at 
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ບໍ່ພົບຜູ້ໃຊ້ນີ້' 
      });
    }

    // Get user groups
    const groups = await dbAll(
      `SELECT g.* FROM groups g
       INNER JOIN user_groups ug ON g.id = ug.group_id
       WHERE ug.user_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...user, groups }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, isAdmin, groupIds } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ' 
      });
    }

    // Check if username exists
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await dbRun(
      `INSERT INTO users (username, password, full_name, email, is_admin)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hashedPassword, fullName, email, isAdmin ? 1 : 0]
    );

    const userId = result.lastID;

    // Assign groups
    if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
      for (const groupId of groupIds) {
        await dbRun(
          'INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)',
          [userId, groupId]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'ສ້າງຜູ້ໃຊ້ສຳເລັດ',
      data: { id: userId }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້' 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { fullName, email, isActive, isAdmin, groupIds } = req.body;
    const userId = req.params.id;

    await dbRun(
      `UPDATE users 
       SET full_name = ?, email = ?, is_active = ?, is_admin = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fullName, email, isActive ? 1 : 0, isAdmin ? 1 : 0, userId]
    );

    // Update groups
    if (groupIds && Array.isArray(groupIds)) {
      await dbRun('DELETE FROM user_groups WHERE user_id = ?', [userId]);

      for (const groupId of groupIds) {
        await dbRun(
          'INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)',
          [userId, groupId]
        );
      }
    }

    res.json({
      success: true,
      message: 'ອັບເດດຂໍ້ມູນສຳເລັດ'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ' 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'ລຶບຜູ້ໃຊ້ສຳເລັດ'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ' 
    });
  }
};

module.exports = {
  resetPassword,
  generateTempPassword,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};