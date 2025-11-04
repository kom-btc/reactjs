const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔍 Checking maker permissions in detail...\n');

  // 1. User info
  db.get('SELECT id, username, is_admin FROM users WHERE username = ?', ['maker'], (err, user) => {
    if (!user) {
      console.log('❌ User not found');
      db.close();
      return;
    }

    console.log('USER:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Is Admin: ${user.is_admin} ${user.is_admin === 1 ? '← THIS IS THE PROBLEM!' : '✓'}`);

    // 2. Groups
    db.all(
      'SELECT g.* FROM groups g INNER JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = ?',
      [user.id],
      (err, groups) => {
        console.log(`\nGROUPS (${groups.length}):`);
        groups.forEach(g => console.log(`  - ${g.name} (ID: ${g.id})`));

        if (groups.length === 0) {
          console.log('\n❌ USER HAS NO GROUPS!\n');
          db.close();
          return;
        }

        // 3. Group permissions
        const groupIds = groups.map(g => g.id);
        db.all(
          `SELECT g.name as group_name, m.name as menu_name, m.path, gp.can_view
           FROM group_permissions gp
           INNER JOIN groups g ON gp.group_id = g.id
           INNER JOIN menus m ON gp.menu_id = m.id
           WHERE gp.group_id IN (${groupIds.join(',')})
           ORDER BY m.order_index`,
          (err, perms) => {
            console.log(`\nGROUP PERMISSIONS (${perms.length}):`);
            perms.forEach(p => {
              const view = p.can_view === 1 ? '✓ YES' : '✗ NO';
              console.log(`  ${view} - ${p.menu_name.padEnd(30)} (Group: ${p.group_name})`);
            });

            const visibleCount = perms.filter(p => p.can_view === 1).length;
            console.log(`\n📊 Summary:`);
            console.log(`  Total permissions: ${perms.length}`);
            console.log(`  Visible (can_view=1): ${visibleCount}`);
            console.log(`  Hidden (can_view=0): ${perms.length - visibleCount}`);

            // 4. Final SQL test
            console.log(`\n🔍 Running actual SQL query...\n`);
            db.all(
              `SELECT DISTINCT m.id, m.name, m.path
               FROM menus m
               INNER JOIN group_permissions gp ON m.id = gp.menu_id
               INNER JOIN user_groups ug ON gp.group_id = ug.group_id
               WHERE ug.user_id = ? 
               AND m.is_active = 1 
               AND gp.can_view = 1
               ORDER BY m.order_index`,
              [user.id],
              (err, result) => {
                console.log(`✅ FINAL RESULT: ${result.length} menus`);
                result.forEach(m => console.log(`  - ${m.name} (${m.path})`));

                if (user.is_admin === 1) {
                  console.log('\n⚠️  WARNING: User is ADMIN! Will see ALL menus regardless of permissions!');
                  console.log('   Run: UPDATE users SET is_admin = 0 WHERE username = "maker";');
                }

                console.log('');
                db.close();
              }
            );
          }
        );
      }
    );
  });
});