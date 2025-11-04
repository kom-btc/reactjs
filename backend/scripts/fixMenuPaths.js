const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔧 Fixing menu paths...\n');

  // ອັບເດດເມນູທີ່ຊ້ຳກັນ
  const updates = [
    { oldPath: '/permissions', newPath: '/group-permissions', name: 'Permission Management' }
  ];

  updates.forEach(update => {
    db.run(
      'UPDATE menus SET path = ? WHERE path = ?',
      [update.newPath, update.oldPath],
      function(err) {
        if (err) {
          console.error(`❌ Error updating ${update.name}:`, err);
        } else if (this.changes > 0) {
          console.log(`✓ Updated "${update.name}": ${update.oldPath} → ${update.newPath}`);
        } else {
          console.log(`ℹ️  No changes for "${update.name}"`);
        }
      }
    );
  });

  // ກວດສອບເມນູທັງໝົດ
  setTimeout(() => {
    db.all('SELECT id, name, path FROM menus ORDER BY order_index', (err, menus) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }

      console.log('\n📋 Current Menus:\n');
      menus.forEach(m => {
        console.log(`  ${m.id}. ${m.name.padEnd(30)} → ${m.path}`);
      });

      console.log('\n✅ Done!\n');
      db.close();
    });
  }, 500);
});