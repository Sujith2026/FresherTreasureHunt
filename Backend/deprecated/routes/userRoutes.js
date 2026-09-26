// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { scanQR, getLeaderboard } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// We protect the 'scan' route. You MUST be logged in to scan.
router.post('/scan', authMiddleware, scanQR);
// Leaderboard can be public
router.get('/leaderboard', getLeaderboard);

module.exports = router;