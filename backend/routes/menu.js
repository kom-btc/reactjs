const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware, isAdminOrAdminGroup } = require('../middleware/auth'); // ⭐
const { auditLog } = require('../middleware/auditLog');

router.use(authMiddleware);
router.use(isAdminOrAdminGroup); // ⭐ ປ່ຽນ


router.get('/', auditLog('VIEW_ALL', 'MENUS'), menuController.getAllMenus);
router.get('/:id', auditLog('VIEW', 'MENU'), menuController.getMenuById);
router.post('/', auditLog('CREATE', 'MENU'), menuController.createMenu);
router.put('/:id', auditLog('UPDATE', 'MENU'), menuController.updateMenu);
router.delete('/:id', auditLog('DELETE', 'MENU'), menuController.deleteMenu);

module.exports = router;