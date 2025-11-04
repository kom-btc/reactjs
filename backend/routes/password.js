// backend/routes/password.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ຟັງຊັນບັນທຶກ audit log
const logAuditAction = (userId, username, action, resource, resourceId, ipAddress, userAgent, details) => {
  db.run(
    `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, username, action, resource, resourceId, ipAddress, userAgent, details],
    (err) => {
      if (err) console.error('Error logging audit action:', err);
    }
  );
};

// Route: ປ່ຽນລະຫັດຜ່ານ
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
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

    // ດຶງຂໍ້ມູນ user
    db.get(
      'SELECT id, username, password FROM users WHERE id = ?',
      [userId],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າເຖິງຖານຂໍ້ມູນ'
          });
        }

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
          });
        }

        // ກວດສອບ password ເກົ່າ
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
          logAuditAction(
            userId,
            user.username,
            'CHANGE_PASSWORD_FAILED',
            'users',
            userId,
            req.ip,
            req.headers['user-agent'],
            'Invalid current password'
          );

          return res.status(401).json({
            success: false,
            message: 'ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ'
          });
        }

        // Hash password ໃໝ່
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // ອັບເດດ password
        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, userId],
          function (err) {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({
                success: false,
                message: 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ'
              });
            }

            // ບັນທຶກ audit log
            logAuditAction(
              userId,
              user.username,
              'CHANGE_PASSWORD',
              'users',
              userId,
              req.ip,
              req.headers['user-agent'],
              'Password changed successfully'
            );

            res.json({
              success: true,
              message: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ'
    });
  }
});

module.exports = router;