# 🚀 CivicSync

A modern civic engagement platform built with Next.js and Node.js, designed to connect citizens with their local government and community initiatives.

## 📌 Tech Stack

- **Frontend**: Next.js 15.5.2 + Tailwind CSS 4 + React 19
- **Backend**: Node.js + Express.js + MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Gmail SMTP
- **Development**: ESLint + Turbopack

## 🏗️ Project Structure

```
CivicSync/
├── frontend/          # Next.js application
│   ├── src/
│   │   └── app/       # App router pages
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # Express.js API server
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── src/           # Source code
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Gmail account for SMTP

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mridul-kr-pandey/CivicSync.git
cd CivicSync
```

### 2️⃣ Frontend Setup (Next.js + Tailwind)

```bash
cd path-pradarshak-app
npm install
npm run dev
```

👉 **Frontend will be available at**: http://localhost:3000

### 3️⃣ Backend Setup (Node.js + Express + MongoDB)

```bash
cd backend
npm install
node server.js
```
##for running
```bash
cd..
npm run dev
```
#then go to localhost:3000

👉 **Backend API will run on**: http://localhost:5000

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civicsync
JWT_SECRET=1a2b05a328d4117ed991c5afdfa487204a70b9bce2aac8d1fa73eb2bdcf8f7d1a4f5b8a7533e4dfebd0a8d8769d9fe82125f208a927b8045f0372f0ccc14420b
```

#for running the project move to folder path-pradarshak-app
npm run dev

