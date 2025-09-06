# Team Setup Guide for MongoDB Atlas

## For Team Members

### Step 1: Get Access Credentials
Ask your project lead for:
- MongoDB Atlas connection string
- Database username and password
- IP whitelist access (if restricted)

### Step 2: Clone the Repository
```bash
git clone <your-repository-url>
cd path-pradarshak-app
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the `backend` directory:

**Option 1: Use the interactive setup script**
```bash
cd backend
node create-env.js
```
This will ask you for the MongoDB Atlas connection string and other settings.

**Option 2: Create manually**
Create `backend/.env` with:
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

**Note:** Replace `<username>` and `<password>` with the actual credentials provided by your project lead.

### Step 5: Start the Application
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend
cd frontend
npm run dev
```

### Step 6: Verify Connection
1. Check backend console for "✅ Connected to MongoDB"
2. Open http://localhost:3000 in your browser
3. Test basic functionality (login, create issues, etc.)

## For Project Lead

### Sharing Credentials Securely

**Option 1: Use a password manager**
- Store MongoDB credentials in a shared password manager
- Share access with team members

**Option 2: Use environment-specific access**
- Create separate database users for each team member
- Use IP whitelisting for additional security

**Option 3: Use a secrets management service**
- Use services like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
- Store connection strings securely

### Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use strong passwords for database users**
3. **Regularly rotate database passwords**
4. **Use IP whitelisting for production environments**
5. **Monitor database access logs**
6. **Use different credentials for different environments (dev, staging, prod)**

### Troubleshooting

**Connection Issues:**
- Check if IP address is whitelisted in MongoDB Atlas
- Verify connection string format
- Ensure database user has proper permissions

**Environment Issues:**
- Make sure `.env` file is in the correct location (`backend/.env`)
- Check that all required environment variables are set
- Restart the server after making changes

**Data Issues:**
- Use the migration script to verify data integrity
- Check MongoDB Atlas logs for any errors
- Ensure all collections were imported correctly

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your `.env` file configuration
3. Test MongoDB Atlas connection independently
4. Contact the project lead for assistance
