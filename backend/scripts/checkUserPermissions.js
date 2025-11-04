const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const username = process.argv[2] || 'maker'; // ເອົາ username ຈາກ argument

db.serialize(() => {
  console.log(`\n🔍 Checking permissions for user: ${username}\n`);

  // ກວດສອບຂໍ້ມູນ user
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    if (!user) {
      console.log('❌ User not found');
      db.close();
      return;
    }

    console.log(`✓ User found: ${user.full_name} (ID: ${user.id})`);
    console.log(`  Is Admin: ${user.is_admin === 1 ? 'Yes' : 'No'}`);
    console.log(`  Is Active: ${user.is_active === 1 ? 'Yes' : 'No'}`);

    // ກວດສອບກຸ່ມ
    db.all(
      `SELECT g.* FROM groups g
       INNER JOIN user_groups ug ON g.id = ug.group_id
       WHERE ug.user_id = ?`,
      [user.id],
      (err, groups) => {
        if (err) {
          console.error('Error:', err);
          return;
        }

        console.log(`\n📁 Groups: ${groups.length}`);
        groups.forEach(g => {
          console.log(`  - ${g.name} (ID: ${g.id})`);
        });

        if (groups.length === 0) {
          console.log('  ⚠️  User is not in any group!');
          db.close();
          return;
        }

        // ກວດສອບເມນູທີ່ມີສິດ
        db.all(
          `SELECT DISTINCT m.id, m.name, m.path, gp.can_view
           FROM menus m
           INNER JOIN group_permissions gp ON m.id = gp.menu_id
           INNER JOIN user_groups ug ON gp.group_id = ug.group_id
           WHERE ug.user_id = ? 
           AND m.is_active = 1
           ORDER BY m.order_index`,
          [user.id],
          (err, allMenus) => {
            if (err) {
              console.error('Error:', err);
              return;
            }

            console.log(`\n📋 All Menus in User's Groups: ${allMenus.length}`);
            allMenus.forEach(m => {
              console.log(`  ${m.can_view === 1 ? '✓' : '✗'} ${m.name} (${m.path}) - can_view: ${m.can_view}`);
            });

            // ກວດສອບເມນູທີ່ສາມາດເຫັນໄດ້
            const visibleMenus = allMenus.filter(m => m.can_view === 1);
            console.log(`\n✅ Visible Menus: ${visibleMenus.length}`);
            visibleMenus.forEach(m => {
              console.log(`  ✓ ${m.name} (${m.path})`);
            });

            db.close();
          }
        );
      }
    );
  });
});