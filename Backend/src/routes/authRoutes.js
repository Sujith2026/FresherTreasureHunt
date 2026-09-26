const express = require('express');
const {
    registerTeam,
    loginTeam,
    getMe,
    adminLogin,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateTeamRegistration } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateTeamRegistration, registerTeam);
router.post('/login', loginTeam);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
