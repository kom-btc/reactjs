const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('\n🔧 Fixing maker user - removing admin privilege...\n');

  // ປ່ຽນ maker ຈາກ admin ເປັນ user ທົ່ວໄປ
  db.run(
    'UPDATE users SET is_admin = 0 WHERE username = ?',
    ['maker'],
    function(err) {
      if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
      }

      if (this.changes === 0) {
        console.log('⚠️  User "maker" not found');
        db.close();
        return;
      }

      console.log('✅ User "maker" is now a REGULAR USER (not admin)');

      // ກວດສອບຜົນລັບ
      db.get('SELECT username, full_name, is_admin, is_active FROM users WHERE username = ?', ['maker'], (err, user) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('\n📋 Updated User Info:');
          console.log(`  Username: ${user.username}`);
          console.log(`  Full Name: ${user.full_name}`);
          console.log(`  Is Admin: ${user.is_admin === 1 ? '❌ YES (still admin!)' : '✅ NO (regular user)'}`);
          console.log(`  Is Active: ${user.is_active === 1 ? 'YES' : 'NO'}`);
          console.log('');
        }
        db.close();
      });
    }
  );
});