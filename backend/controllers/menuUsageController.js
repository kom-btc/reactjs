// backend/controllers/menuUsageController.js
const db = require('../config/database');
const { promisify } = require('util');

const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

// ບັນທຶກການເຂົ້າໃຊ້ menu
const logMenuAccess = async (req, res) => {
  try {
    // ⭐ ກວດສອບວ່າ req.body ເປັນ object
    console.log('📝 Received body:', req.body);
    console.log('📝 Body type:', typeof req.body);
    
    const { menuId, menuPath, menuName } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    // Validation
    if (!menuId || !menuPath || !menuName) {
      console.error('❌ Missing required fields:', { menuId, menuPath, menuName });
      return res.status(400).json({
        success: false,
        message: 'ກະລຸນາໃສ່ຂໍ້ມູນ menu ໃຫ້ຄົບຖ້ວນ'
      });
    }

    // ສ້າງ details object
    const details = {
      menuPath: String(menuPath),
      menuName: String(menuName),
      timestamp: new Date().toISOString()
    };

    // ບັນທຶກລົງ database
    await dbRun(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        'ACCESS_MENU',
        String(menuName), // ເກັບ menu name ໃນ resource
        menuId,
        req.ip || '::1',
        req.headers['user-agent'] || 'Unknown',
        JSON.stringify(details) // ⭐ Stringify ທີ່ນີ້ເທົ່ານັ້ນ
      ]
    );

    console.log(`✅ Menu access logged: ${username} → ${menuName}`);

    res.json({ 
      success: true,
      message: 'ບັນທຶກສຳເລັດ'
    });

  } catch (error) {
    console.error('❌ Log menu access error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດ' 
    });
  }
};

// ... ຟັງຊັນອື່ນໆຄືເກົ່າ
const getMenuUsageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        al.id,
        al.user_id,
        al.username,
        al.resource as menu_name,
        al.resource_id as menu_id,
        al.details,
        al.created_at,
        al.ip_address,
        u.full_name,
        u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.action = 'ACCESS_MENU'
    `;
    
    const params = [];

    if (startDate) {
      query += ` AND DATE(al.created_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(al.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY al.created_at DESC LIMIT 1000`;

    const logs = await dbAll(query, params);
    
    // Parse details JSON
    const parsedLogs = logs.map(log => {
      let parsedDetails = {};
      try {
        parsedDetails = JSON.parse(log.details);
      } catch (e) {
        console.error('Error parsing details:', e, 'Details:', log.details);
      }
      
      return {
        ...log,
        menu_path: parsedDetails.menuPath || '',
        menu_name_detail: parsedDetails.menuName || log.menu_name,
        computer_name: parsedDetails.computerName || 'Unknown',
        browser: parsedDetails.browser || 'Unknown',
        os: parsedDetails.os || 'Unknown'
      };
    });

    res.json({ 
      success: true, 
      data: parsedLogs 
    });

  } catch (error) {
    console.error('❌ Get report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດ' 
    });
  }
};

const getMenuUsageSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        al.resource_id as menu_id,
        al.resource as menu_name,
        COUNT(*) as access_count,
        COUNT(DISTINCT al.user_id) as unique_users,
        MAX(al.created_at) as last_access
      FROM audit_logs al
      WHERE al.action = 'ACCESS_MENU'
    `;
    
    const params = [];

    if (startDate) {
      query += ` AND DATE(al.created_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(al.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` GROUP BY al.resource_id, al.resource ORDER BY access_count DESC`;

    const summary = await dbAll(query, params);

    res.json({ 
      success: true, 
      data: summary 
    });
  } catch (error) {
    console.error('❌ Get menu summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດ' 
    });
  }
};

const getUserMenuUsageSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        al.user_id, al.username,
        u.full_name, u.email,
        COUNT(*) as total_access,
        COUNT(DISTINCT al.resource_id) as unique_menus,
        MAX(al.created_at) as last_access
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.action = 'ACCESS_MENU'
    `;
    
    const params = [];

    if (startDate) {
      query += ` AND DATE(al.created_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(al.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` GROUP BY al.user_id ORDER BY total_access DESC`;

    const summary = await dbAll(query, params);
    res.json({ 
      success: true, 
      data: summary 
    });
  } catch (error) {
    console.error('❌ Get user summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດ' 
    });
  }
};

module.exports = {
  logMenuAccess,
  getMenuUsageReport,
  getMenuUsageSummary,
  getUserMenuUsageSummary
};