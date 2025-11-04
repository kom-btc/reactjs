const db = require('../config/database');
const { promisify } = require('util');

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

const checkPermission = (action = 'view') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const menuPath = req.baseUrl + (req.route?.path || '');

      // Admin has all permissions
      if (req.user.isAdmin) {
        return next();
      }

      // Get menu by path
      const menu = await dbGet(
        'SELECT id FROM menus WHERE path = ? AND is_active = 1',
        [menuPath]
      );

      if (!menu) {
        return res.status(404).json({ 
          success: false, 
          message: 'ບໍ່ພົບເມນູນີ້' 
        });
      }

      // Check user-specific permission first
      const userPermission = await dbGet(
        `SELECT can_${action} as hasPermission 
         FROM user_permissions 
         WHERE user_id = ? AND menu_id = ?`,
        [userId, menu.id]
      );

      if (userPermission) {
        if (userPermission.hasPermission) {
          return next();
        } else {
          return res.status(403).json({ 
            success: false, 
            message: 'ທ່ານບໍ່ມີສິດໃນການດຳເນີນການນີ້' 
          });
        }
      }

      // Check group permissions
      const groupPermissions = await dbAll(
        `SELECT gp.can_${action} as hasPermission
         FROM group_permissions gp
         INNER JOIN user_groups ug ON gp.group_id = ug.group_id
         WHERE ug.user_id = ? AND gp.menu_id = ?`,
        [userId, menu.id]
      );

      const hasPermission = groupPermissions.some(p => p.hasPermission === 1);

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        message: 'ທ່ານບໍ່ມີສິດໃນການດຳເນີນການນີ້' 
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບສິດ' 
      });
    }
  };
};

module.exports = { checkPermission };