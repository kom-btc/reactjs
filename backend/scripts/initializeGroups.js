// backend/scripts/initializeGroups.js
const db = require('../config/database');

console.log('🚀 Initializing default groups...');

// ສ້າງ groups
const defaultGroups = [
  { name: 'admin', description: 'Administrator group with full access' },
  { name: 'checker', description: 'Checker group for verification' },
  { name: 'maker', description: 'Maker group for data entry' }
];

db.serialize(() => {
  const insertGroup = db.prepare(`
    INSERT OR IGNORE INTO groups (name, description)
    VALUES (?, ?)
  `);

  defaultGroups.forEach(group => {
    insertGroup.run(group.name, group.description, function(err) {
      if (err) {
        console.error(`❌ Error creating group ${group.name}:`, err);
      } else if (this.changes > 0) {
        console.log(`✅ Group created: ${group.name}`);
      } else {
        console.log(`ℹ️  Group already exists: ${group.name}`);
      }
    });
  });

  insertGroup.finalize(() => {
    // ກຳນົດ permissions ໃຫ້ admin group
    db.get('SELECT id FROM groups WHERE name = ?', ['admin'], (err, adminGroup) => {
      if (err || !adminGroup) {
        console.error('❌ Admin group not found');
        db.close();
        return;
      }

      db.all('SELECT id FROM menus', [], (err, menus) => {
        if (err) {
          console.error('❌ Error getting menus:', err);
          db.close();
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
          console.log(`✅ Admin group permissions set for ${menus.length} menus`);
          
          // ເພີ່ມ admin user ເຂົ້າ admin group
          db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, adminUser) => {
            if (adminUser) {
              db.run(
                'INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
                [adminUser.id, adminGroup.id],
                (err) => {
                  if (!err) {
                    console.log('✅ Admin user added to admin group');
                  }
                  db.close();
                  console.log('✅ Initialization complete!');
                }
              );
            } else {
              db.close();
              console.log('✅ Initialization complete!');
            }
          });
        });
      });
    });
  });
});