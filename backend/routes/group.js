const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authMiddleware, isAdminOrAdminGroup } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

router.use(authMiddleware);
router.use(isAdminOrAdminGroup); // ⭐ ປ່ຽນ
//router.use(isAdmin);

router.get('/', auditLog('VIEW_ALL', 'GROUPS'), groupController.getAllGroups);
router.get('/:id', auditLog('VIEW', 'GROUP'), groupController.getGroupById);
router.post('/', auditLog('CREATE', 'GROUP'), groupController.createGroup);
router.put('/:id', auditLog('UPDATE', 'GROUP'), groupController.updateGroup);
router.delete('/:id', auditLog('DELETE', 'GROUP'), groupController.deleteGroup);

// Permission Management
router.get('/:groupId/permissions', auditLog('VIEW_GROUP_PERMISSIONS', 'GROUP'), groupController.getGroupPermissions);
router.post('/:groupId/permissions', auditLog('ASSIGN_PERMISSIONS', 'GROUP'), groupController.assignPermissions);

// Menu Management
router.get('/:groupId/menus', auditLog('VIEW_GROUP_MENUS', 'GROUP'), groupController.getGroupMenus);
router.post('/:groupId/menus', auditLog('ADD_MENU_TO_GROUP', 'GROUP'), groupController.addMenuToGroup);
router.delete('/:groupId/menus/:menuId', auditLog('REMOVE_MENU_FROM_GROUP', 'GROUP'), groupController.removeMenuFromGroup);

// Member Management
router.get('/:groupId/members', auditLog('VIEW_GROUP_MEMBERS', 'GROUP'), groupController.getGroupMembers);
router.post('/:groupId/members', auditLog('ADD_USER_TO_GROUP', 'GROUP'), groupController.addUserToGroup);
router.delete('/:groupId/members/:userId', auditLog('REMOVE_USER_FROM_GROUP', 'GROUP'), groupController.removeUserFromGroup);

module.exports = router;