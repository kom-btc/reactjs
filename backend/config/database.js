const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Groups Table
    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menus Table
    db.run(`
      CREATE TABLE IF NOT EXISTS menus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT UNIQUE NOT NULL,
        icon TEXT,
        order_index INTEGER DEFAULT 0,
        parent_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES menus (id)
      )
    `);

    // User Groups Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INTEGER,
        group_id INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, group_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
      )
    `);

    // Group Permissions Table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_permissions (
        group_id INTEGER,
        menu_id INTEGER,
        can_view INTEGER DEFAULT 1,
        can_create INTEGER DEFAULT 0,
        can_edit INTEGER DEFAULT 0,
        can_delete INTEGER DEFAULT 0,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, menu_id),
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE
      )
    `);

    // User Permissions Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id INTEGER,
        menu_id INTEGER,
        can_view INTEGER DEFAULT 1,
        can_create INTEGER DEFAULT 0,
        can_edit INTEGER DEFAULT 0,
        can_delete INTEGER DEFAULT 0,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, menu_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE
      )
    `);

    // Audit Log Table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        resource_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // ⭐ Insert default groups
    const defaultGroups = [
      { name: 'admin', description: 'Administrator group with full access' },
      { name: 'checker', description: 'Checker group for verification' },
      { name: 'maker', description: 'Maker group for data entry' }
    ];

    const insertGroup = db.prepare(`
      INSERT OR IGNORE INTO groups (name, description)
      VALUES (?, ?)
    `);

    defaultGroups.forEach(group => {
      insertGroup.run(group.name, group.description);
    });

    insertGroup.finalize(() => {
      console.log('✅ Default groups created');
      
      // ⭐ ກຳນົດ permissions ໃຫ້ admin group ກັບທຸກເມນູ
      db.all('SELECT id FROM menus', [], (err, menus) => {
        if (err) {
          console.error('Error getting menus:', err);
          return;
        }

        db.get('SELECT id FROM groups WHERE name = ?', ['admin'], (err, adminGroup) => {
          if (err || !adminGroup) {
            console.error('Error getting admin group:', err);
            return;
          }

          const insertPermission = db.prepare(`
            INSERT OR IGNORE INTO group_permissions (group_id, menu_id, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, 1, 1, 1, 1)
          `);

          menus.forEach(menu => {
            insertPermission.run(adminGroup.id, menu.id);
          });

          insertPermission.finalize(() => {
            console.log('✅ Admin group permissions set');
          });
        });
      });
    });

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT OR IGNORE INTO users (username, password, full_name, email, is_admin)
      VALUES ('admin', ?, 'Administrator', 'admin@example.com', 1)
    `, [defaultPassword], function(err) {
      if (err) {
        console.error('Error creating admin user:', err);
      } else if (this.changes > 0) {
        console.log('✅ Default admin user created');
        
        // ⭐ ເພີ່ມ admin user ເຂົ້າ admin group
        db.get('SELECT id FROM groups WHERE name = ?', ['admin'], (err, adminGroup) => {
          if (!err && adminGroup) {
            db.run(
              'INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
              [this.lastID, adminGroup.id],
              (err) => {
                if (!err) {
                  console.log('✅ Admin user added to admin group');
                }
              }
            );
          }
        });
      }
    });

    // Insert default menus
    const defaultMenus = [
      { name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon', order: 1 },
      { name: 'User Management', path: '/users', icon: 'UsersIcon', order: 2 },
      { name: 'User Report', path: '/user-report', icon: 'DocumentTextIcon', order: 3 },
      { name: 'Group Management', path: '/groups', icon: 'UserGroupIcon', order: 4 },
      { name: 'Group Menus', path: '/group-menus', icon: 'ViewColumnsIcon', order: 5 },
      { name: 'Group Permissions', path: '/group-permissions', icon: 'ShieldCheckIcon', order: 6 },
      { name: 'Group Members', path: '/group-members', icon: 'UsersIcon', order: 7 },
      { name: 'Menu Management', path: '/menus', icon: 'Bars3Icon', order: 8 },
      { name: 'Audit Logs', path: '/audit-logs', icon: 'DocumentTextIcon', order: 9 },
      { name: 'Profile', path: '/profile', icon: 'UserCircleIcon', order: 10 },
      { name: 'Change Password', path: '/change-password', icon: 'KeyIcon', order: 11 },
      { name: 'Menu Usage Report', path: '/menu-usage-report', icon: 'ChartBarIcon', order: 12 }
    ];

    const insertMenu = db.prepare(`
      INSERT OR IGNORE INTO menus (name, path, icon, order_index)
      VALUES (?, ?, ?, ?)
    `);

    defaultMenus.forEach(menu => {
      insertMenu.run(menu.name, menu.path, menu.icon, menu.order);
    });

    insertMenu.finalize();

    console.log('✅ Database initialized successfully');
  });
}

module.exports = db;