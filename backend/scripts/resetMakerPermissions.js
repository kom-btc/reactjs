const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔧 Resetting maker group permissions to ONLY 2 menus...\n');

  // 1. ຫາ group ID
  db.get('SELECT id FROM groups WHERE name = ?', ['maker'], (err, group) => {
    if (err || !group) {
      console.error('❌ Group "maker" not found');
      db.close();
      return;
    }

    console.log(`✓ Found group "maker" (ID: ${group.id})`);

    // 2. ລຶບສິດທັງໝົດອອກກ່ອນ
    db.run('DELETE FROM group_permissions WHERE group_id = ?', [group.id], function(err) {
      if (err) {
        console.error('❌ Error deleting old permissions:', err);
        db.close();
        return;
      }
      console.log(`✓ Deleted ${this.changes} old permissions`);

      // 3. ເພີ່ມສິດໃໝ່ສຳລັບ 2 menus ເທົ່ານັ້ນ
      const allowedPaths = ['/dashboard', '/user-report'];

      db.all(
        `SELECT id, name, path FROM menus WHERE path IN (?, ?) AND is_active = 1`,
        allowedPaths,
        (err, menus) => {
          if (err) {
            console.error('❌ Error finding menus:', err);
            db.close();
            return;
          }

          if (menus.length === 0) {
            console.error('❌ No menus found with paths:', allowedPaths);
            db.close();
            return;
          }

          console.log(`\n✅ Setting permissions for ${menus.length} menus:\n`);

          const stmt = db.prepare(`
            INSERT INTO group_permissions 
            (group_id, menu_id, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, 1, 0, 0, 0)
          `);

          menus.forEach(menu => {
            stmt.run(group.id, menu.id, (err) => {
              if (err) {
                console.error(`❌ Error for ${menu.name}:`, err);
              } else {
                console.log(`  ✓ ${menu.name} (${menu.path}) - can_view = 1`);
              }
            });
          });

          stmt.finalize(() => {
            // 4. ກວດສອບຜົນລັບ
            setTimeout(() => {
              db.all(
                `SELECT m.name, m.path, gp.can_view
                 FROM menus m
                 INNER JOIN group_permissions gp ON m.id = gp.menu_id
                 WHERE gp.group_id = ?
                 ORDER BY m.order_index`,
                [group.id],
                (err, finalPerms) => {
                  console.log(`\n📋 Final Permissions (${finalPerms.length}):\n`);
                  finalPerms.forEach(p => {
                    const view = p.can_view === 1 ? '✓' : '✗';
                    console.log(`  ${view} ${p.name} (${p.path})`);
                  });

                  console.log('\n✅ Maker group permissions reset successfully!');
                  console.log('\nNow logout and login again with maker user.\n');
                  db.close();
                }
              );
            }, 500);
          });
        }
      );
    });
  });
});