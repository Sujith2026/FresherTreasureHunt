// server.js
require('dotenv').config(); // Load .env variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

// Import Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

// Verify routes loaded correctly
console.log('✅ Routes loaded:');
console.log('   - Auth routes: /api/v1/auth');
console.log('   - User routes: /api/v1/users');

const app = express();

// Middleware setup
// 1. CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS
app.use(cors(corsOptions));

// 2. Body parsing
app.use(express.json());

// 2.5. Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// 3. API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// 4. 404 handler (must come after all routes but before error handler)
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    console.log(`   Available routes: POST /api/v1/auth/signup, POST /api/v1/auth/login`);
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'POST /api/v1/auth/signup',
            'POST /api/v1/auth/login',
            'POST /api/v1/users/scan',
            'GET /api/v1/users/leaderboard'
        ]
    });
});

// 5. Error handling (should be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.json({ message: 'Freshers API', status: 'ok' });
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`\n✅ Server is listening on port ${port}...\n`);
      console.log('📋 Available routes:');
      console.log('   POST /api/v1/auth/signup');
      console.log('   POST /api/v1/auth/login');
      console.log('   POST /api/v1/users/scan');
      console.log('   GET /api/v1/users/leaderboard');
      console.log('\n');
    });
  } catch (error) {
    console.log('❌ Database connection error:', error);
  }
};

start();