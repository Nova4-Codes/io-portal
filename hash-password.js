const bcrypt = require('bcryptjs');
const saltRounds = 10; // Standard salt rounds

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as a command line argument.');
  console.log('Usage: node hash-password.js <your_password>');
  process.exit(1);
}

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Hashed Password:', hash);
});
