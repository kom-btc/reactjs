// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ⭐ Middleware - ລຳດັບສຳຄັນ!
app.use(helmet());
app.use(cors());
app.use(express.json()); // ⭐ ຕ້ອງມີນີ້ກ່ອນ routes
app.use(express.urlencoded({ extended: true })); // ⭐ ເພີ່ມນີ້ດ້ວຍ

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/groups', require('./routes/group'));
app.use('/api/menus', require('./routes/menu'));
app.use('/api/permissions', require('./routes/permission'));
app.use('/api/menu-usage', require('./routes/menuUsage'));
app.use('/api/audit-logs', require('./routes/auditLog'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;