// backend/routes/permission.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authMiddleware, isAdminOrAdminGroup } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

router.use(authMiddleware);
router.use(isAdminOrAdminGroup);

// ⭐ ກວດສອບວ່າມີ functions ເຫຼົ່ານີ້ຢູ່ໃນ controller ບໍ່
router.get('/group/:groupId', auditLog('VIEW_GROUP_PERMISSIONS', 'PERMISSIONS'), permissionController.getGroupPermissions);
router.put('/group/:groupId', auditLog('UPDATE_GROUP_PERMISSIONS', 'PERMISSIONS'), permissionController.updateGroupPermissions);
router.get('/user/:userId', auditLog('VIEW_USER_PERMISSIONS', 'PERMISSIONS'), permissionController.getUserPermissions);
router.put('/user/:userId', auditLog('UPDATE_USER_PERMISSIONS', 'PERMISSIONS'), permissionController.updateUserPermissions);

module.exports = router;