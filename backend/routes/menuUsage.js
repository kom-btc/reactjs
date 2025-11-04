// backend/routes/menuUsage.js
const express = require('express');
const router = express.Router();
const menuUsageController = require('../controllers/menuUsageController');
const { authMiddleware, isAdminGroup } = require('../middleware/auth'); // ⭐ ປ່ຽນ

// ບັນທຶກການເຂົ້າໃຊ້ menu (ທຸກຄົນທີ່ login ແລ້ວສາມາດໃຊ້ໄດ້)
router.post('/log', authMiddleware, menuUsageController.logMenuAccess);

// ລາຍງານ (Admin Group ເທົ່ານັ້ນ)
router.get('/report', authMiddleware, isAdminGroup, menuUsageController.getMenuUsageReport); // ⭐
router.get('/summary/menu', authMiddleware, isAdminGroup, menuUsageController.getMenuUsageSummary); // ⭐
router.get('/summary/user', authMiddleware, isAdminGroup, menuUsageController.getUserMenuUsageSummary); // ⭐

module.exports = router;