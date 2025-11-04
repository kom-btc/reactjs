const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔄 Recreating all menus...\n');

  // 1. ລຶບເມນູທັງໝົດ (ລະວັງ: ຈະລຶບ permissions ທັງໝົດດ້ວຍ)
  db.run('DELETE FROM group_permissions', (err) => {
    if (err) console.error('Error deleting group_permissions:', err);
  });

  db.run('DELETE FROM user_permissions', (err) => {
    if (err) console.error('Error deleting user_permissions:', err);
  });

  db.run('DELETE FROM menus', (err) => {
    if (err) {
      console.error('Error deleting menus:', err);
    } else {
      console.log('✓ Cleared all old menus');
    }
  });

  // 2. ສ້າງເມນູໃໝ່
  setTimeout(() => {
    const menus = [
      { name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon', order: 1 },
      { name: 'User Management', path: '/users', icon: 'UsersIcon', order: 2 },
      { name: 'User Report', path: '/user-report', icon: 'DocumentTextIcon', order: 3 },
      { name: 'Group Management', path: '/groups', icon: 'UserGroupIcon', order: 4 },
      { name: 'Group Menus', path: '/group-menus', icon: 'ViewColumnsIcon', order: 5 },
      { name: 'Group Permissions', path: '/group-permissions', icon: 'ShieldCheckIcon', order: 6 },
      { name: 'Group Members', path: '/group-members', icon: 'UsersIcon', order: 7 },
      { name: 'Menu Management', path: '/menus', icon: 'Bars3Icon', order: 8 },
      { name: 'Audit Logs', path: '/audit-logs', icon: 'DocumentTextIcon', order: 9 },
      { name: 'Profile', path: '/profile', icon: 'UserCircleIcon', order: 10 }
    ];

    console.log('\n✨ Creating new menus...\n');

    const stmt = db.prepare(
      'INSERT INTO menus (name, path, icon, order_index, is_active) VALUES (?, ?, ?, ?, 1)'
    );

    menus.forEach(menu => {
      stmt.run(menu.name, menu.path, menu.icon, menu.order, (err) => {
        if (err) {
          console.error(`❌ Error creating ${menu.name}:`, err);
        } else {
          console.log(`✓ Created: ${menu.name} (${menu.path})`);
        }
      });
    });

    stmt.finalize(() => {
      // 3. ຕັ້ງສິດໃໝ່ໃຫ້ກຸ່ມ maker
      setTimeout(() => {
        console.log('\n🔐 Setting permissions for maker group...\n');

        db.get('SELECT id FROM groups WHERE name = ?', ['maker'], (err, group) => {
          if (err || !group) {
            console.log('⚠️  Group "maker" not found, skipping permissions');
            db.close();
            return;
          }

          const allowedPaths = ['/dashboard', '/user-report'];

          db.all(
            `SELECT id, name, path FROM menus WHERE path IN (${allowedPaths.map(() => '?').join(',')})`,
            allowedPaths,
            (err, allowedMenus) => {
              if (err) {
                console.error('Error:', err);
                db.close();
                return;
              }

              allowedMenus.forEach(menu => {
                db.run(
                  `INSERT INTO group_permissions 
                   (group_id, menu_id, can_view, can_create, can_edit, can_delete)
                   VALUES (?, ?, 1, 0, 0, 0)`,
                  [group.id, menu.id],
                  (err) => {
                    if (err) {
                      console.error(`❌ Error setting permission for ${menu.name}:`, err);
                    } else {
                      console.log(`✓ Permission set: ${menu.name}`);
                    }
                  }
                );
              });

              setTimeout(() => {
                console.log('\n✅ All done! Please restart the backend.\n');
                db.close();
              }, 500);
            }
          );
        });
      }, 1000);
    });
  }, 500);
});