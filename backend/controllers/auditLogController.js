// backend/controllers/auditLogController.js
const db = require('../config/database');
const { promisify } = require('util');

const dbAll = promisify(db.all.bind(db));

// ດຶງ Audit Logs ທັງໝົດ
const getAuditLogs = async (req, res) => {
  try {
    const { action, username, startDate, endDate, resource } = req.query;
    
    console.log('📊 Get audit logs with filters:', { action, username, startDate, endDate, resource });
    
    let query = `
      SELECT * FROM audit_logs
      WHERE 1=1
    `;
    
    const params = [];

    // ກອງຕາມ action
    if (action) {
      query += ` AND action = ?`;
      params.push(action);
    }

    // ກອງຕາມ username
    if (username) {
      query += ` AND username LIKE ?`;
      params.push(`%${username}%`);
    }

    // ກອງຕາມ resource
    if (resource) {
      query += ` AND resource LIKE ?`;
      params.push(`%${resource}%`);
    }

    // ກອງຕາມວັນທີເລີ່ມຕົ້ນ
    if (startDate) {
      query += ` AND DATE(created_at) >= ?`;
      params.push(startDate);
    }

    // ກອງຕາມວັນທີສິ້ນສຸດ
    if (endDate) {
      query += ` AND DATE(created_at) <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY created_at DESC LIMIT 1000`;

    const logs = await dbAll(query, params);

    console.log(`✅ Found ${logs.length} audit logs`);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });

  } catch (error) {
    console.error('❌ Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    });
  }
};

// ດຶງສະຖິຕິການໃຊ້ງານ
const getAuditStats = async (req, res) => {
  try {
    const stats = await dbAll(`
      SELECT 
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs
      WHERE created_at >= date('now', '-7 days')
      GROUP BY action
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ'
    });
  }
};

// ລຶບ audit logs ເກົ່າ (ຖ້າຕ້ອງການ)
const cleanOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const result = await db.run(
      `DELETE FROM audit_logs WHERE created_at < date('now', '-${days} days')`
    );

    res.json({
      success: true,
      message: `ລຶບ audit logs ທີ່ເກົ່າກວ່າ ${days} ວັນສຳເລັດ`,
      deleted: result.changes
    });

  } catch (error) {
    console.error('❌ Clean old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ'
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
  cleanOldLogs
};