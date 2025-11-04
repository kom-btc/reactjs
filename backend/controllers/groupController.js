const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Custom dbRun
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

const getAllGroups = async (req, res) => {
  try {
    const groups = await dbAll(
      'SELECT * FROM groups ORDER BY created_at DESC'
    );

    // ດຶງຈຳນວນ members ແຕ່ລະກຸ່ມ
    for (let group of groups) {
      const members = await dbAll(
        'SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?',
        [group.id]
      );
      group.memberCount = members[0].count;
    }

    res.json({
      success: true,
      data: groups
    });

  } catch (error) {
    console.error('Get all groups error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await dbGet(
      'SELECT * FROM groups WHERE id = ?',
      [req.params.id]
    );

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'ບໍ່ພົບກຸ່ມນີ້' 
      });
    }

    // Get group members
    const members = await dbAll(
      `SELECT u.id, u.username, u.full_name, u.email, u.is_active
       FROM users u
       INNER JOIN user_groups ug ON u.id = ug.user_id
       WHERE ug.group_id = ?`,
      [req.params.id]
    );

    // Get group permissions
    const permissions = await dbAll(
      `SELECT m.*, gp.can_view, gp.can_create, gp.can_edit, gp.can_delete
       FROM menus m
       INNER JOIN group_permissions gp ON m.id = gp.menu_id
       WHERE gp.group_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...group, members, permissions }
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ' 
    });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາປ້ອນຊື່ກຸ່ມ' 
      });
    }

    const result = await dbRun(
      'INSERT INTO groups (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: 'ສ້າງກຸ່ມສຳເລັດ',
      data: { id: result.lastID }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງກຸ່ມ' 
    });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    await dbRun(
      'UPDATE groups SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, req.params.id]
    );

    res.json({
      success: true,
      message: 'ອັບເດດກຸ່ມສຳເລັດ'
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ' 
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    await dbRun('DELETE FROM groups WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'ລຶບກຸ່ມສຳເລັດ'
    });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ' 
    });
  }
};

const assignPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { permissions } = req.body;

    // Delete existing permissions
    await dbRun('DELETE FROM group_permissions WHERE group_id = ?', [groupId]);

    // Insert new permissions
    if (permissions && Array.isArray(permissions)) {
      for (const perm of permissions) {
        await dbRun(
          `INSERT INTO group_permissions 
           (group_id, menu_id, can_view, can_create, can_edit, can_delete)
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
    }

    res.json({
      success: true,
      message: 'ກຳນົດສິດສຳເລັດ'
    });

  } catch (error) {
    console.error('Assign permissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການກຳນົດສິດ' 
    });
  }
};

const getGroupMenus = async (req, res) => {
  try {
    const { groupId } = req.params;

    const menus = await dbAll(
      `SELECT DISTINCT m.* 
       FROM menus m
       INNER JOIN group_permissions gp ON m.id = gp.menu_id
       WHERE gp.group_id = ? AND gp.can_view = 1 AND m.is_active = 1
       ORDER BY m.order_index`,
      [groupId]
    );

    res.json({
      success: true,
      data: menus
    });

  } catch (error) {
    console.error('Get group menus error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນເມນູ' 
    });
  }
};

const addMenuToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { menuId } = req.body;

    if (!menuId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາເລືອກເມນູ' 
      });
    }

    const existing = await dbGet(
      'SELECT * FROM group_permissions WHERE group_id = ? AND menu_id = ?',
      [groupId, menuId]
    );

    if (existing) {
      await dbRun(
        'UPDATE group_permissions SET can_view = 1 WHERE group_id = ? AND menu_id = ?',
        [groupId, menuId]
      );
    } else {
      await dbRun(
        `INSERT INTO group_permissions (group_id, menu_id, can_view)
         VALUES (?, ?, 1)`,
        [groupId, menuId]
      );
    }

    res.json({
      success: true,
      message: 'ເພີ່ມເມນູສຳເລັດ'
    });

  } catch (error) {
    console.error('Add menu to group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມເມນູ' 
    });
  }
};

const removeMenuFromGroup = async (req, res) => {
  try {
    const { groupId, menuId } = req.params;

    await dbRun(
      'UPDATE group_permissions SET can_view = 0 WHERE group_id = ? AND menu_id = ?',
      [groupId, menuId]
    );

    res.json({
      success: true,
      message: 'ລຶບເມນູສຳເລັດ'
    });

  } catch (error) {
    console.error('Remove menu from group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບເມນູ' 
    });
  }
};

// ເພີ່ມຟັງຊັນໃໝ່: ຈັດການ Members ໃນ Group
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await dbAll(
      `SELECT u.id, u.username, u.full_name, u.email, u.is_active, u.is_admin
       FROM users u
       INNER JOIN user_groups ug ON u.id = ug.user_id
       WHERE ug.group_id = ?
       ORDER BY u.full_name`,
      [groupId]
    );

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສະມາຊິກ' 
    });
  }
};

const addUserToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ກະລຸນາເລືອກຜູ້ໃຊ້' 
      });
    }

    // ກວດສອບວ່າມີຢູ່ແລ້ວບໍ່
    const existing = await dbGet(
      'SELECT * FROM user_groups WHERE user_id = ? AND group_id = ?',
      [userId, groupId]
    );

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'ຜູ້ໃຊ້ນີ້ຢູ່ໃນກຸ່ມນີ້ແລ້ວ' 
      });
    }

    await dbRun(
      'INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)',
      [userId, groupId]
    );

    res.json({
      success: true,
      message: 'ເພີ່ມສະມາຊິກສຳເລັດ'
    });

  } catch (error) {
    console.error('Add user to group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສະມາຊິກ' 
    });
  }
};

const removeUserFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    await dbRun(
      'DELETE FROM user_groups WHERE user_id = ? AND group_id = ?',
      [userId, groupId]
    );

    res.json({
      success: true,
      message: 'ລຶບສະມາຊິກສຳເລັດ'
    });

  } catch (error) {
    console.error('Remove user from group error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບສະມາຊິກ' 
    });
  }
};

// ເພີ່ມຟັງຊັນດຶງສິດຂອງ Group
const getGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const permissions = await dbAll(
      `SELECT m.*, gp.can_view, gp.can_create, gp.can_edit, gp.can_delete
       FROM menus m
       LEFT JOIN group_permissions gp ON m.id = gp.menu_id AND gp.group_id = ?
       WHERE m.is_active = 1
       ORDER BY m.order_index`,
      [groupId]
    );

    res.json({
      success: true,
      data: permissions
    });

  } catch (error) {
    console.error('Get group permissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິດ' 
    });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  assignPermissions,
  getGroupMenus,
  addMenuToGroup,
  removeMenuFromGroup,
  getGroupMembers,
  addUserToGroup,
  removeUserFromGroup,
  getGroupPermissions
};