const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const username = process.argv[2] || 'maker';
const groupName = process.argv[3] || 'maker';

db.serialize(() => {
  console.log(`\n🔧 Assigning user "${username}" to group "${groupName}"...\n`);

  // ຫາ user ID
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      console.error('❌ User not found');
      db.close();
      return;
    }

    // ຫາ group ID
    db.get('SELECT id FROM groups WHERE name = ?', [groupName], (err, group) => {
      if (err || !group) {
        console.error('❌ Group not found');
        db.close();
        return;
      }

      // Assign user to group
      db.run(
        'INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
        [user.id, group.id],
        function(err) {
          if (err) {
            console.error('❌ Error assigning user to group:', err);
          } else if (this.changes > 0) {
            console.log(`✅ User "${username}" assigned to group "${groupName}" successfully!`);
          } else {
            console.log(`ℹ️  User "${username}" is already in group "${groupName}"`);
          }
          db.close();
        }
      );
    });
  });
});