const express = require('express');
const {
    getLeaderboard,
    getTeamRank,
} = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/', getLeaderboard);

// Protected route
router.get('/rank', authMiddleware, getTeamRank);

module.exports = router;
