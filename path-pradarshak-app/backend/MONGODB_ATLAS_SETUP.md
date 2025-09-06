# MongoDB Atlas Setup Guide (Fresh Start)

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose M0 free tier)
4. Wait for cluster to be ready (5-10 minutes)

## Step 2: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 3: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, add `0.0.0.0/0` (allows access from anywhere)
4. For production, add specific IP addresses of your team members
5. Click "Confirm"

## Step 4: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

## Step 5: Create .env File
**Option 1: Use the interactive setup script**
```bash
cd backend
node create-env.js
```

**Option 2: Create manually**
Create a `.env` file in the `backend` directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/accountability_partner?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000


# Razorpay Configuration (if using payment features)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

**Important:** Replace `<username>` and `<password>` with your actual database user credentials, and replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL.

## Step 6: Test Connection
1. Start your backend server: `npm run dev`
2. Check the console for "✅ Connected to MongoDB"
3. Test your application functionality (signup, login, create issues, etc.)

## Step 7: Share with Team
Share the following with your team members:
1. MongoDB Atlas connection string (with credentials)
2. Instructions to create their own `.env` file
3. Database access credentials

## Security Notes
- Never commit `.env` files to version control
- Use strong passwords for database users
- Consider using IP whitelisting for production
- Regularly rotate database passwords
- Use environment-specific connection strings for different stages
