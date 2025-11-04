// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// Login - ບໍ່ຕ້ອງມີ authMiddleware (ຍັງບໍ່ທັນມີ token)
router.post('/login', auditLog('LOGIN', 'AUTH'), authController.login);

// Profile - ຕ້ອງມີ authMiddleware ກ່ອນ
router.get('/profile', authMiddleware, auditLog('VIEW_PROFILE', 'AUTH'), authController.getProfile);

// Get Menus - ຕ້ອງມີ authMiddleware ກ່ອນ
router.get('/menus', authMiddleware, auditLog('VIEW_MENUS', 'AUTH'), authController.getUserMenus);

// Change Password - ຕ້ອງມີ authMiddleware ກ່ອນ
router.put(
  '/change-password',
  authMiddleware,
  auditLog('CHANGE_PASSWORD', 'AUTH'),
  authController.changePassword
);

module.exports = router;