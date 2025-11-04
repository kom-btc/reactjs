const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🚀 Setting up Maker user and group...\n');

  // 1. ສ້າງກຸ່ມ maker
  db.run(
    'INSERT OR IGNORE INTO groups (name, description) VALUES (?, ?)',
    ['maker', 'Maker user group'],
    function(err) {
      if (err) {
        console.error('❌ Error creating group:', err);
        return;
      }
      console.log('✓ Group "maker" created (ID:', this.lastID, ')');
    }
  );

  // 2. ສ້າງ user maker
  const password = bcrypt.hashSync('maker123', 10);
  db.run(
    'INSERT OR IGNORE INTO users (username, password, full_name, email, is_admin, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    ['maker', password, 'Maker User', 'maker@example.com', 0, 1],
    function(err) {
      if (err) {
        console.error('❌ Error creating user:', err);
        return;
      }
      console.log('✓ User "maker" created (ID:', this.lastID, ')');
      console.log('  Password: maker123');
    }
  );

  // 3. Assign user to group
  setTimeout(() => {
    db.get('SELECT id FROM users WHERE username = ?', ['maker'], (err, user) => {
      if (err || !user) return;

      db.get('SELECT id FROM groups WHERE name = ?', ['maker'], (err, group) => {
        if (err || !group) return;

        db.run(
          'INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
          [user.id, group.id],
          function(err) {
            if (err) {
              console.error('❌ Error assigning user to group:', err);
            } else {
              console.log('✓ User assigned to group successfully');
            }
          }
        );
      });
    });
  }, 500);

  // 4. ກຳນົດສິດໃຫ້ກຸ່ມ maker (Dashboard ແລະ User Report)
  setTimeout(() => {
    db.get('SELECT id FROM groups WHERE name = ?', ['maker'], (err, group) => {
      if (err || !group) return;

      // ຫາເມນູທີ່ຕ້ອງການໃຫ້ເຂົ້າເຖິງ
      const menuPaths = ['/dashboard', '/user-report'];

      db.all(
        `SELECT id, name, path FROM menus WHERE path IN (${menuPaths.map(() => '?').join(',')})`,
        menuPaths,
        (err, menus) => {
          if (err) {
            console.error('Error finding menus:', err);
            return;
          }

          console.log(`\n📋 Setting permissions for ${menus.length} menus:\n`);

          menus.forEach(menu => {
            db.run(
              `INSERT OR REPLACE INTO group_permissions 
               (group_id, menu_id, can_view, can_create, can_edit, can_delete)
               VALUES (?, ?, 1, 0, 0, 0)`,
              [group.id, menu.id],
              (err) => {
                if (err) {
                  console.error(`❌ Error setting permission for ${menu.name}:`, err);
                } else {
                  console.log(`✓ Permission set: ${menu.name} (${menu.path})`);
                }
              }
            );
          });

          setTimeout(() => {
            console.log('\n✅ Setup completed successfully!');
            console.log('\nYou can now login with:');
            console.log('  Username: maker');
            console.log('  Password: maker123\n');
            db.close();
          }, 1000);
        }
      );
    });
  }, 1000);
});