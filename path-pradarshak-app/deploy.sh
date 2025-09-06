#!/bin/bash

echo "🚀 CivicSync Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote origin not set. Please add your GitHub repository:"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    exit 1
fi

echo "✅ Git repository found"
echo "📤 Pushing code to GitHub..."

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for deployment - $(date)"

# Push to GitHub
git push origin main

echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to [Railway.app](https://railway.app) and deploy your backend"
echo "2. Go to [Vercel.com](https://vercel.com) and deploy your frontend"
echo "3. Set up MongoDB Atlas for your database"
echo "4. Connect your domain pathpradarshak.in"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Good luck with your deployment!"

