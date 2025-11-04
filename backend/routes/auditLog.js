// backend/routes/auditLog.js
const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authMiddleware, isAdminGroup } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

// ດຶງ audit logs (Admin Group ເທົ່ານັ້ນ)
router.get('/', authMiddleware, isAdminGroup, auditLogController.getAuditLogs);

// ດຶງສະຖິຕິ
router.get('/stats', authMiddleware, isAdminGroup, auditLogController.getAuditStats);

// ລຶບ logs ເກົ່າ
router.delete(
  '/clean',
  authMiddleware,
  isAdminGroup,
  auditLog('CLEAN_LOGS', 'AUDIT'),
  auditLogController.cleanOldLogs
);

module.exports = router;