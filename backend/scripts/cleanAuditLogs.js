const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // ລຶບ audit logs ທີ່ມີ details ໃຫຍ່ເກີນໄປ
  db.run(`
    DELETE FROM audit_logs 
    WHERE length(details) > 10000
  `, (err) => {
    if (err) {
      console.error('Error cleaning logs:', err);
    } else {
      console.log('✓ Cleaned large audit logs');
    }
  });

  // ອັບເດດ details ທີ່ເຫຼືອໃຫ້ສັ້ນລົງ
  db.run(`
    UPDATE audit_logs 
    SET details = substr(details, 1, 1000)
    WHERE length(details) > 1000
  `, (err) => {
    if (err) {
      console.error('Error truncating details:', err);
    } else {
      console.log('✓ Truncated long details');
    }
  });

  // ກວດສອບຜົນລັບ
  db.get('SELECT COUNT(*) as count FROM audit_logs', (err, row) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log(`\n✅ Total audit logs: ${row.count}`);
    }
    db.close();
  });
});