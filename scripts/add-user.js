// Add or update a login:  npm run add-user -- email@example.com "Full Name" password [role]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const [email, name, password, role = 'coordinator'] = process.argv.slice(2);
if (!email || !name || !password) {
  console.error('Usage: npm run add-user -- email@example.com "Full Name" password [role]');
  process.exit(1);
}

const file = path.join(__dirname, '..', 'data', 'users.json');
const users = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const hash = bcrypt.hashSync(password, 10);
const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

if (existing) {
  Object.assign(existing, { name, role, passwordHash: hash });
  console.log(`Updated ${email}`);
} else {
  users.push({ id: 'u_' + crypto.randomBytes(4).toString('hex'), name, email: email.toLowerCase(), role, department: 'CSE', passwordHash: hash });
  console.log(`Added ${email}`);
}
fs.writeFileSync(file, JSON.stringify(users, null, 2) + '\n');
