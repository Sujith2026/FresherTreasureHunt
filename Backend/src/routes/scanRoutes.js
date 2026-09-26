const express = require('express');
const { scanQR, getScanHistory } = require('../controllers/scanController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateScan } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validateScan, scanQR);
router.get('/history', getScanHistory);

module.exports = router;
