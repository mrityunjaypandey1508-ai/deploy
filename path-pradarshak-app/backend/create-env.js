const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createEnvFile() {
  console.log('🔧 MongoDB Atlas Environment Setup');
  console.log('=====================================\n');

  try {
    const mongodbUri = await question('Enter your MongoDB Atlas connection string: ');
    const jwtSecret = await question('Enter JWT secret (or press Enter for default): ') || 'your-super-secret-jwt-key-change-this-in-production';
    const port = await question('Enter server port (or press Enter for 5000): ') || '5000';
    const frontendUrl = await question('Enter frontend URL (or press Enter for http://localhost:3000): ') || 'http://localhost:3000';

    const envContent = `# MongoDB Configuration
MONGODB_URI=${mongodbUri}

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=${port}
NODE_ENV=development

# Frontend URL
FRONTEND_URL=${frontendUrl}


# Razorpay Configuration (if using payment features)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    console.log('\n🚀 You can now start your server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  } finally {
    rl.close();
  }
}

createEnvFile();
