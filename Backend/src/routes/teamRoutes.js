const express = require('express');
const {
    addMember,
    removeMember,
    getTeamDetails,
} = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateMemberData } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTeamDetails);
router.post('/add-member', validateMemberData, addMember);
router.delete('/remove-member/:memberId', removeMember);

module.exports = router;
