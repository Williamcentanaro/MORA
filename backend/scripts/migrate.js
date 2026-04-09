require('dotenv').config();
const { execSync } = require('child_process');

try {
  console.log('Running Prisma Migrate...');
  execSync('npx prisma migrate dev --name add_email_verification_and_reset_tokens', { stdio: 'inherit' });
  console.log('Migration successful!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
