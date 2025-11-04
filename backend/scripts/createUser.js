const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// ຮັບຄ່າຈາກ command line
const username = process.argv[2];
const password = process.argv[3] || 'password123';
const fullName = process.argv[4] || username;
const email = process.argv[5] || `${username}@example.com`;

if (!username) {
  console.log('Usage: node createUser.js <username> [password] [fullName] [email]');
  console.log('Example: node createUser.js john john123 "John Doe" john@example.com');
  process.exit(1);
}

const hashedPassword = bcrypt.hashSync(password, 10);

db.run(
  'INSERT INTO users (username, password, full_name, email, is_admin, is_active) VALUES (?, ?, ?, ?, 0, 1)',
  [username, hashedPassword, fullName, email],
  function(err) {
    if (err) {
      console.error('❌ Error creating user:', err.message);
    } else {
      console.log('\n✅ User created successfully!');
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}`);
      console.log(`  Full Name: ${fullName}`);
      console.log(`  Email: ${email}`);
      console.log(`  User ID: ${this.lastID}\n`);
    }
    db.close();
  }
);