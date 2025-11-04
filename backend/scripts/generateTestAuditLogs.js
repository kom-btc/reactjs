const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const testLogs = [
  {
    user_id: 1,
    username: 'admin',
    action: 'LOGIN',
    resource: 'AUTH',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'POST', path: '/api/auth/login', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'VIEW_ALL',
    resource: 'USERS',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'GET', path: '/api/users', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'CREATE',
    resource: 'USER',
    resource_id: 2,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'POST', path: '/api/users', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'CREATE',
    resource: 'GROUP',
    resource_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'POST', path: '/api/groups', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'VIEW_ALL',
    resource: 'GROUPS',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'GET', path: '/api/groups', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'UPDATE',
    resource: 'USER',
    resource_id: 2,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'PUT', path: '/api/users/2', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'DELETE',
    resource: 'USER',
    resource_id: 3,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'DELETE', path: '/api/users/3', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'ASSIGN_PERMISSIONS',
    resource: 'GROUP',
    resource_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'POST', path: '/api/groups/1/permissions', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'VIEW',
    resource: 'MENU',
    resource_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'GET', path: '/api/menus/1', success: true })
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'ADD_USER_TO_GROUP',
    resource: 'GROUP',
    resource_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: JSON.stringify({ method: 'POST', path: '/api/groups/1/members', success: true })
  }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  testLogs.forEach((log, index) => {
    stmt.run(
      log.user_id,
      log.username,
      log.action,
      log.resource,
      log.resource_id || null,
      log.ip_address,
      log.user_agent,
      log.details,
      index, // ສ້າງເວລາແຕກຕ່າງກັນ (0-9 ຊົ່ວໂມງກ່ອນ)
      (err) => {
        if (err) {
          console.error('Error inserting log:', err);
        } else {
          console.log(`✓ Added log ${index + 1}: ${log.action} - ${log.resource}`);
        }
      }
    );
  });

  stmt.finalize(() => {
    // ກວດສອບຈຳນວນທັງໝົດ
    db.get('SELECT COUNT(*) as count FROM audit_logs', (err, row) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log(`\n✅ Total audit logs in database: ${row.count}`);
        console.log(`✅ Test data created successfully!`);
      }
      db.close();
    });
  });
});