# Backend API for Data Hunter
## 🚀 Deployment on Railway
1. Go to [Railway](https://railway.app/) and create a new project.
2. Link this repository or upload your backend code.
3. Set environment variables in Railway dashboard:
  - `PORT` (e.g., 5000)
  - `NODE_ENV` (production)
  - `MONGO_URI` (your MongoDB URI)
  - `JWT_SECRET` (secure random string, min 32 chars)
  - `ADMIN_USERNAME` (your admin username)
  - `ADMIN_PASSWORD` (your admin password)
  - `CORS_ORIGIN` (your Vercel frontend domain, e.g., https://your-vercel-app.vercel.app)
4. Deploy! Railway will build and start your backend automatically.

## 🛠️ Notes
- Make sure your backend is accessible at `/api/*` endpoints.
- Update the frontend's `vercel.json` to proxy `/api` requests to your Railway backend.
- For local development, use `.env` file as per `.env.example`.
# Data Hunter - Backend API 🎯

A production-grade Node.js + Express + MongoDB backend for Data Hunter, a QR-based team competition platform where teams compete by scanning QR codes placed around a venue.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [QR Scanning Logic](#qr-scanning-logic)
- [Admin Panel](#admin-panel)
- [Testing](#testing)
- [Deployment](#deployment)

---

## ✨ Features

### Core Functionality

- ✅ JWT-based authentication with password hashing (bcrypt)
- ✅ Team registration and login system
- ✅ Multi-member team support
- ✅ QR code scanning with stage validation
- ✅ Real-time leaderboard with rankings
- ✅ Point scoring system (correct/wrong/duplicate handling)
- ✅ Race condition prevention with lock mechanism
- ✅ Comprehensive scan logging and analytics

### Security & Performance

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Atomic database operations
- ✅ Lock helper to prevent concurrent scan conflicts

### Admin Features

- ✅ Full team management (view, edit, delete)
- ✅ QR stage management (create, edit, delete)
- ✅ Dashboard with analytics and statistics
- ✅ Event reset functionality
- ✅ Scan log monitoring

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Security:** Helmet, CORS
- **Validation:** Custom middleware + validator
- **Logging:** Morgan (development)

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── pointsConfig.json     # Scoring configuration
│   ├── models/
│   │   ├── Team.js               # Team schema & methods
│   │   ├── QRStage.js            # QR stage schema
│   │   └── ScanLog.js            # Scan history schema
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── scanController.js     # QR scanning logic
│   │   ├── teamController.js     # Team management
│   │   ├── leaderboardController.js
│   │   └── adminController.js    # Admin operations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── scanRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── adminMiddleware.js    # Admin access control
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Global error handler
│   ├── services/
│   │   ├── scoreService.js       # Scoring logic
│   │   └── teamService.js        # Team operations
│   ├── utils/
│   │   └── lockHelper.js         # Concurrency control
│   ├── app.js                    # Express app setup
│   └── server.js                 # Server entry point
├── scripts/
│   └── seed.js                   # Database seeder
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone and Install

```bash
cd Backend
npm install
```

### Step 2: Configure Environment

Create a `.env` file (or copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/datahunter

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=*
```

### Step 3: Start MongoDB

Make sure MongoDB is running:

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

### Step 4: Seed Database

Populate the database with sample QR stages and teams:

```bash
npm run seed
```

This will create:

- 6 QR stages (QR001-START through QR006-FINISH)
- 3 sample teams (Alpha Hunters, Beta Squad, Gamma Force)

### Step 5: Start Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:{PORT}`

---

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

| Method | Endpoint       | Description           | Auth    |
| ------ | -------------- | --------------------- | ------- |
| POST   | `/register`    | Register new team     | Public  |
| POST   | `/login`       | Team login            | Public  |
| GET    | `/me`          | Get current team info | Private |
| POST   | `/admin/login` | Admin login           | Public  |

### Team Routes (`/api/team`)

| Method | Endpoint                   | Description      | Auth    |
| ------ | -------------------------- | ---------------- | ------- |
| GET    | `/`                        | Get team details | Private |
| POST   | `/add-member`              | Add team member  | Private |
| DELETE | `/remove-member/:memberId` | Remove member    | Private |

### Scan Routes (`/api/scan`)

| Method | Endpoint   | Description      | Auth    |
| ------ | ---------- | ---------------- | ------- |
| POST   | `/`        | Scan QR code     | Private |
| GET    | `/history` | Get scan history | Private |

### Leaderboard Routes (`/api/leaderboard`)

| Method | Endpoint | Description     | Auth    |
| ------ | -------- | --------------- | ------- |
| GET    | `/`      | Get leaderboard | Public  |
| GET    | `/rank`  | Get team rank   | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint     | Description         | Auth  |
| ------ | ------------ | ------------------- | ----- |
| GET    | `/teams`     | Get all teams       | Admin |
| GET    | `/team/:id`  | Get team by ID      | Admin |
| PATCH  | `/team/:id`  | Update team         | Admin |
| DELETE | `/team/:id`  | Delete team         | Admin |
| GET    | `/qr`        | Get all QR stages   | Admin |
| POST   | `/qr`        | Create QR stage     | Admin |
| PATCH  | `/qr/:id`    | Update QR stage     | Admin |
| DELETE | `/qr/:id`    | Delete QR stage     | Admin |
| GET    | `/dashboard` | Get dashboard stats | Admin |
| GET    | `/scans`     | Get all scan logs   | Admin |
| POST   | `/reset`     | Reset event         | Admin |

---

## 📦 Database Models

### Team Model

```javascript
{
  teamName: String,        // Unique team name
  passwordHash: String,    // Hashed password
  members: [{
    name: String,
    email: String,
    role: String,          // 'leader' or 'member'
    joinedAt: Date
  }],
  points: Number,          // Current points
  currentStage: Number,    // Current stage number
  isActive: Boolean,       // Team status
  completedStages: [Number],
  lastScanAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### QRStage Model

```javascript
{
  code: String,            // Unique QR code
  stageIndex: Number,      // Stage number
  hint: String,            // Hint for next stage
  pointsForCorrect: Number,
  pointsForWrong: Number,
  active: Boolean,
  description: String,
  location: String,
  scanCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### ScanLog Model

```javascript
{
  teamId: ObjectId,
  teamName: String,
  memberId: ObjectId,
  memberName: String,
  qrCode: String,
  stageIndex: Number,
  teamStageAtScan: Number,
  result: String,          // 'accepted', 'rejected', 'duplicate', 'error'
  pointsDelta: Number,
  totalPointsAfter: Number,
  message: String,
  ipAddress: String,
  scannedAt: Date
}
```

---

## 🔑 Authentication

### Team Registration

**POST** `/api/auth/register`

```json
{
  "teamName": "Alpha Hunters",
  "password": "securePassword123",
  "leaderName": "John Doe",
  "leaderEmail": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Team registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "team": {
      "id": "64abc...",
      "teamName": "Alpha Hunters",
      "points": 0,
      "currentStage": 1,
      "members": [...]
    }
  }
}
```

### Team Login

**POST** `/api/auth/login`

```json
{
  "teamName": "Alpha Hunters",
  "password": "securePassword123"
}
```

### Using JWT Token

Include the token in Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 QR Scanning Logic

### Scan Request

**POST** `/api/scan`

```json
{
  "qrCode": "QR001-START",
  "memberId": "64abc...",
  "memberName": "John Doe"
}
```

### Scan Results

#### ✅ Correct Scan (Matching Stage)

```json
{
  "success": true,
  "result": "accepted",
  "pointsAdded": 100,
  "totalPoints": 500,
  "currentStage": 2,
  "nextHint": "Check the bulletin board near the cafeteria",
  "message": "Correct! You earned 100 points!"
}
```

#### ❌ Wrong Scan (Wrong Stage)

```json
{
  "success": false,
  "result": "rejected",
  "pointsDeducted": 20,
  "totalPoints": 480,
  "currentStage": 1,
  "message": "Wrong stage QR scanned. 20 points deducted."
}
```

#### ⚠️ Duplicate Scan

```json
{
  "success": false,
  "result": "duplicate",
  "totalPoints": 500,
  "currentStage": 2,
  "message": "You've already scanned this QR. No points awarded."
}
```

### Edge Cases Handled

1. **Duplicate Prevention:** Same QR cannot be scanned twice by same team
2. **Stage Skipping:** Teams cannot skip stages (configurable)
3. **Race Conditions:** Lock mechanism prevents simultaneous scans
4. **Inactive QR:** Only active QR codes can be scanned
5. **Concurrent Members:** Only one scan counts if multiple members scan simultaneously

---

## 👨‍💼 Admin Panel

### Admin Login

**POST** `/api/auth/admin/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Dashboard Stats

**GET** `/api/admin/dashboard`

Returns:

- Total teams, active teams
- Total stages, active stages
- Total scans
- Scan analytics (accepted/rejected/duplicate)
- Top 5 teams
- Recent scans

### Event Reset

**POST** `/api/admin/reset`

```json
{
  "type": "full" // Options: "scores", "stages", "full"
}
```

- `scores`: Reset all points to 0
- `stages`: Reset all teams to stage 1
- `full`: Reset everything + clear scan logs

---

## 🧪 Testing

### Using cURL

**Register Team:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Test Team",
    "password": "password123",
    "leaderName": "Test Leader",
    "leaderEmail": "leader@test.com"
  }'
```

**Scan QR:**

```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR001-START",
    "memberId": "64abc123",
    "memberName": "John Doe"
  }'
```

**Get Leaderboard:**

```bash
curl http://localhost:5000/api/leaderboard
```

### Using Postman/Thunder Client

1. Import endpoints from this README
2. Set base URL: `http://localhost:5000/api`
3. For protected routes, add token to Authorization header
4. Test all CRUD operations

---

## 📊 Scoring Configuration

Edit `src/config/pointsConfig.json` to customize:

```json
{
  "scoring": {
    "defaultCorrectPoints": 100,
    "defaultWrongPenalty": 20,
    "minPoints": 0
  },
  "gameplay": {
    "allowSkipStages": false,
    "maxTeamMembers": 10,
    "enableDuplicatePrevention": true,
    "penalizeWrongStage": true,
    "penalizeSkippedStage": true,
    "skipStagePenalty": 50
  },
  "advanced": {
    "enableConcurrencyProtection": true,
    "scanCooldownSeconds": 5,
    "maxScansPerMinute": 12
  }
}
```

---

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (min 32 characters)
3. Update `ADMIN_USERNAME` and `ADMIN_PASSWORD`
4. Configure proper `CORS_ORIGIN`
5. Use MongoDB Atlas for cloud database

### Production Checklist

- ✅ Enable HTTPS
- ✅ Set up rate limiting
- ✅ Configure logging (Winston/Pino)
- ✅ Set up monitoring (PM2, New Relic)
- ✅ Implement Redis for caching
- ✅ Enable database backups
- ✅ Configure firewall rules
- ✅ Set up CI/CD pipeline

---

## 📝 Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample data
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

ISC License

---

## 🎉 Acknowledgments

Built for the Data Hunter event platform - where teams compete, scan, and win!

---

**Need Help?** Open an issue or contact the development team.

**Happy Hunting! 🎯**
