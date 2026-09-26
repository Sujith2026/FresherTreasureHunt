const express = require('express');
const {
    startGame,
    scanQR,
    getGameLogs,
    getCurrentHint,
    scanRejoinQR,
} = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Start the game (scan start QR)
router.post('/start', startGame);

// Scan a QR code during the game
router.post('/scan', scanQR);

// Get team's hint logs and progress
router.get('/logs', getGameLogs);

// Get current active hint
router.get('/current-hint', getCurrentHint);

// Scan rejoin QR to rejoin after elimination
router.post('/rejoin', scanRejoinQR);

module.exports = router;
