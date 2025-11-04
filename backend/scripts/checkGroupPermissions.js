const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const groupName = process.argv[2] || 'maker';

db.serialize(() => {
  console.log(`\n🔍 Checking permissions for group: ${groupName}\n`);

  db.get('SELECT * FROM groups WHERE name = ?', [groupName], (err, group) => {
    if (err || !group) {
      console.error('❌ Group not found');
      db.close();
      return;
    }

    console.log(`✓ Group found: ${group.name} (ID: ${group.id})`);

    db.all(
      `SELECT m.name, m.path, gp.can_view, gp.can_create, gp.can_edit, gp.can_delete
       FROM menus m
       INNER JOIN group_permissions gp ON m.id = gp.menu_id
       WHERE gp.group_id = ?
       ORDER BY m.order_index`,
      [group.id],
      (err, permissions) => {
        if (err) {
          console.error('Error:', err);
          db.close();
          return;
        }

        console.log(`\n📋 Permissions (${permissions.length} menus):\n`);
        
        if (permissions.length === 0) {
          console.log('  ⚠️  No permissions set for this group!');
          console.log('  Please go to "Group Permissions" menu to set permissions.');
        } else {
          console.log('Menu Name                | Path                  | View | Create | Edit | Delete');
          console.log('-'.repeat(85));
          permissions.forEach(p => {
            const view = p.can_view ? '✓' : '✗';
            const create = p.can_create ? '✓' : '✗';
            const edit = p.can_edit ? '✓' : '✗';
            const del = p.can_delete ? '✓' : '✗';
            console.log(`${p.name.padEnd(25)} ${p.path.padEnd(22)} ${view}    ${create}      ${edit}    ${del}`);
          });

          const visibleCount = permissions.filter(p => p.can_view === 1).length;
          console.log(`\n✅ Visible Menus: ${visibleCount}/${permissions.length}`);
        }

        db.close();
      }
    );
  });
});