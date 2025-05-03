import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'admin1234';
  // Using a fixed salt for consistent hash generation
  const salt = '$2b$10$1234567890123456789012';
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash to store in DB:', hash);
}

generateHash(); 