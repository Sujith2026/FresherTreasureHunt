const express = require('express');
const {
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getAllQRStages,
    createQRStage,
    updateQRStage,
    deleteQRStage,
    getDashboardStats,
    resetEvent,
    getAllScans,
    // NEW: Hint management
    getAllHints,
    createHint,
    updateHint,
    deleteHint,
    getHintById,
    // NEW: QR code image management
    getQRCodesWithImages,
    regenerateQRCode,
    downloadQRCode,
    // NEW: Event control
    getEventSettings,
    startEvent,
    endEvent,
    updateEventSettings,
    // NEW: Team elimination
    eliminateTeam,
    reactivateTeam,
    // NEW: Rejoin QR management
    getAllRejoinQRs,
    createRejoinQR,
    updateRejoinQR,
    deleteRejoinQR,
    getRejoinQRById,
} = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// All routes require admin authentication
router.use(adminMiddleware);

// Team management
router.get('/teams', getAllTeams);
router.get('/team/:id', getTeamById);
router.patch('/team/:id', updateTeam);
router.delete('/team/:id', deleteTeam);

// NEW: Team elimination
router.post('/team/:id/eliminate', eliminateTeam);
router.post('/team/:id/reactivate', reactivateTeam);

// QR stage management
router.get('/qr', getAllQRStages);
router.post('/qr', createQRStage);
router.patch('/qr/:id', updateQRStage);
router.delete('/qr/:id', deleteQRStage);

// NEW: QR code images for admin dashboard
router.get('/qr-images', getQRCodesWithImages);
router.post('/qr/:id/regenerate', regenerateQRCode);
router.get('/qr/:id/download', downloadQRCode);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/scans', getAllScans);

// Event management
router.post('/reset', resetEvent);

// NEW: Event control
router.get('/event/settings', getEventSettings);
router.post('/event/start', startEvent);
router.post('/event/end', endEvent);
router.patch('/event/settings', updateEventSettings);

// NEW: Hint management routes
router.get('/hints', getAllHints);
router.post('/hints', createHint);
router.get('/hints/:id', getHintById);
router.patch('/hints/:id', updateHint);
router.delete('/hints/:id', deleteHint);

// NEW: Rejoin QR management routes
router.get('/rejoin-qr', getAllRejoinQRs);
router.post('/rejoin-qr', createRejoinQR);
router.get('/rejoin-qr/:id', getRejoinQRById);
router.patch('/rejoin-qr/:id', updateRejoinQR);
router.delete('/rejoin-qr/:id', deleteRejoinQR);

module.exports = router;
