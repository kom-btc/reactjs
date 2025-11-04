// backend/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, isAdminOrAdminGroup } = require('../middleware/auth'); // ⭐ ໃຊ້ຕົວປະສົມ
const { auditLog } = require('../middleware/auditLog');

// ທຸກ route ຕ້ອງຜ່ານ authMiddleware ແລະ isAdminOrAdminGroup
router.use(authMiddleware);
router.use(isAdminOrAdminGroup); // ⭐ ປ່ຽນຈາກ isAdmin

// CRUD Routes
router.get('/', auditLog('VIEW_ALL', 'USERS'), userController.getAllUsers);
router.get('/:id', auditLog('VIEW', 'USER'), userController.getUserById);
router.post('/', auditLog('CREATE', 'USER'), userController.createUser);
router.put('/:id', auditLog('UPDATE', 'USER'), userController.updateUser);
router.delete('/:id', auditLog('DELETE', 'USER'), userController.deleteUser);

// Reset Password Routes
router.put('/:userId/reset-password', auditLog('RESET_PASSWORD', 'USERS'), userController.resetPassword);
router.post('/:userId/generate-temp-password', auditLog('GENERATE_TEMP_PASSWORD', 'USERS'), userController.generateTempPassword);

module.exports = router;