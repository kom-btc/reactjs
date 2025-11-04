// backend/controllers/permissionController.js
const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

// ດຶງ permissions ຂອງ group
const getGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const permissions = await dbAll(
      `SELECT 
        gp.*,
        m.name as menu_name,
        m.path as menu_path,
        m.icon as menu_icon
       FROM group_permissions gp
       INNER JOIN menus m ON gp.menu_id = m.id
       WHERE gp.group_id = ?
       ORDER BY m.order_index`,
      [groupId]
    );

    res.json({
      success: true,
      data: permissions
    });

  } catch (error) {
    console.error('❌ Get group permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    });
  }
};

// ອັບເດດ permissions ຂອງ group
const updateGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { permissions } = req.body; // Array of { menuId, canView, canCreate, canEdit, canDelete }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      });
    }

    // ລຶບ permissions ເກົ່າ
    await dbRun('DELETE FROM group_permissions WHERE group_id = ?', [groupId]);

    // ເພີ່ມ permissions ໃໝ່
    for (const perm of permissions) {
      await dbRun(
        `INSERT INTO group_permissions (group_id, menu_id, can_view, can_create, can_edit, can_delete)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          groupId,
          perm.menuId,
          perm.canView ? 1 : 0,
          perm.canCreate ? 1 : 0,
          perm.canEdit ? 1 : 0,
          perm.canDelete ? 1 : 0
        ]
      );
    }

    res.json({
      success: true,
      message: 'ອັບເດດ permissions ສຳເລັດ'
    });

  } catch (error) {
    console.error('❌ Update group permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    });
  }
};

// ດຶງ permissions ຂອງ user
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const permissions = await dbAll(
      `SELECT 
        up.*,
        m.name as menu_name,
        m.path as menu_path,
        m.icon as menu_icon
       FROM user_permissions up
       INNER JOIN menus m ON up.menu_id = m.id
       WHERE up.user_id = ?
       ORDER BY m.order_index`,
      [userId]
    );

    res.json({
      success: true,
      data: permissions
    });

  } catch (error) {
    console.error('❌ Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    });
  }
};

// ອັບເດດ permissions ຂອງ user
const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      });
    }

    // ລຶບ permissions ເກົ່າ
    await dbRun('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

    // ເພີ່ມ permissions ໃໝ່
    for (const perm of permissions) {
      await dbRun(
        `INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          perm.menuId,
          perm.canView ? 1 : 0,
          perm.canCreate ? 1 : 0,
          perm.canEdit ? 1 : 0,
          perm.canDelete ? 1 : 0
        ]
      );
    }

    res.json({
      success: true,
      message: 'ອັບເດດ permissions ສຳເລັດ'
    });

  } catch (error) {
    console.error('❌ Update user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    });
  }
};

// ========================
// EXPORTS
// ========================
module.exports = {
  getGroupPermissions,
  updateGroupPermissions,
  getUserPermissions,
  updateUserPermissions
};