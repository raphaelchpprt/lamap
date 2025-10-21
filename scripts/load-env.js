/**
 * Load environment variables from .env.local for scripts
 */
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  // Parse and set environment variables
  envContent.split('\n').forEach((line) => {
    // Skip empty lines and comments
    if (!line || line.trim().startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });

  console.log('✅ Environment variables loaded from .env.local');
} else {
  console.warn('⚠️  .env.local not found');
}
