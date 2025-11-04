const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔧 Fixing duplicate menu paths...\n');

  // 1. ສະແດງເມນູທັງໝົດກ່ອນ
  db.all('SELECT id, name, path, order_index FROM menus ORDER BY id', (err, menus) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    console.log('📋 Current Menus:\n');
    menus.forEach(m => {
      console.log(`  ${m.id}. ${m.name.padEnd(30)} → ${m.path} (order: ${m.order_index})`);
    });

    // 2. ລຶບເມນູທີ່ຊ້ຳຫຼືບໍ່ຕ້ອງການອອກ
    console.log('\n🗑️  Removing duplicate/old menus...\n');

    // ລຶບເມນູທີ່ມີ path /permissions (ເກົ່າ)
    db.run(
      'DELETE FROM menus WHERE path = ? AND name = ?',
      ['/permissions', 'Permission Management'],
      function(err) {
        if (err) {
          console.error('❌ Error removing old Permission Management:', err);
        } else if (this.changes > 0) {
          console.log('✓ Removed old "Permission Management" (/permissions)');
        }
      }
    );

    // 3. ໃຫ້ແນ່ໃຈວ່າມີເມນູທີ່ຖືກຕ້ອງ
    setTimeout(() => {
      const correctMenus = [
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

      console.log('\n✅ Ensuring correct menus exist...\n');

      correctMenus.forEach(menu => {
        db.run(
          `INSERT OR IGNORE INTO menus (name, path, icon, order_index, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [menu.name, menu.path, menu.icon, menu.order],
          function(err) {
            if (err) {
              console.error(`❌ Error for ${menu.name}:`, err);
            } else if (this.changes > 0) {
              console.log(`✓ Added: ${menu.name} (${menu.path})`);
            }
          }
        );
      });

      // 4. ສະແດງເມນູທີ່ອັບເດດແລ້ວ
      setTimeout(() => {
        db.all('SELECT id, name, path, order_index FROM menus ORDER BY order_index', (err, updatedMenus) => {
          if (err) {
            console.error('Error:', err);
            db.close();
            return;
          }

          console.log('\n📋 Updated Menus:\n');
          updatedMenus.forEach(m => {
            console.log(`  ${m.id}. ${m.name.padEnd(30)} → ${m.path}`);
          });

          console.log('\n✅ All menus fixed!\n');
          db.close();
        });
      }, 1000);
    }, 500);
  });
});