const Team = require('../models/Team');
const QRStage = require('../models/QRStage');
const ScanLog = require('../models/ScanLog');
const Hint = require('../models/Hint'); // NEW: Hint model
const EventSettings = require('../models/EventSettings'); // NEW: Event settings model
const RejoinQR = require('../models/RejoinQR'); // NEW: Rejoin QR model
const ScoreService = require('../services/scoreService');
const QRCode = require('qrcode'); // NEW: QR code generation

/**
 * @desc    Get all teams
 * @route   GET /api/admin/teams
 * @access  Admin
 */
const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find()
            .select('-passwordHash')
            .sort({ points: -1, createdAt: 1 });

        res.json({
            success: true,
            count: teams.length,
            data: { teams },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single team by ID
 * @route   GET /api/admin/team/:id
 * @access  Admin
 */
const getTeamById = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id).select('-passwordHash');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Get team's scan history
        const scanHistory = await ScanLog.getTeamHistory(team._id, 20);

        res.json({
            success: true,
            data: {
                team,
                recentScans: scanHistory,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update team points or stage
 * @route   PATCH /api/admin/team/:id
 * @access  Admin
 */
const updateTeam = async (req, res, next) => {
    try {
        const { points, isActive } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Update fields if provided
        if (points !== undefined) team.points = Math.max(0, points);
        // Stage-based progression is deprecated, so currentStage updates are ignored
        if (isActive !== undefined) team.isActive = isActive;

        await team.save();

        res.json({
            success: true,
            message: 'Team updated successfully',
            data: { team },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete team
 * @route   DELETE /api/admin/team/:id
 * @access  Admin
 */
const deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Also delete team's scan logs
        await ScanLog.deleteMany({ teamId: team._id });

        res.json({
            success: true,
            message: 'Team deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all QR stages
 * @route   GET /api/admin/qr
 * @access  Admin
 */
const getAllQRStages = async (req, res, next) => {
    try {
        const stages = await QRStage.find().sort({ stageIndex: 1 });

        res.json({
            success: true,
            count: stages.length,
            data: { stages },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new QR stage
 * @route   POST /api/admin/qr
 * @access  Admin
 */
const createQRStage = async (req, res, next) => {
    try {
        const { code, stageIndex, hintType, hintValue, pointsForCorrect, pointsForWrong, description, location, active, isStartQR, linkedHintId, locationName } = req.body;

        if (!code || stageIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields (code, stageIndex)',
            });
        }

        // Generate QR code image
        const qrCodeImage = await QRCode.toDataURL(code.toUpperCase(), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        const stage = await QRStage.create({
            code: code.toUpperCase(),
            stageIndex,
            hintType,
            hintValue,
            pointsForCorrect: pointsForCorrect || 100,
            pointsForWrong: pointsForWrong || 20,
            description,
            location,
            active: active !== undefined ? active : true,
            isStartQR: isStartQR || false,
            linkedHintId,
            locationName,
            qrCodeImage, // Store the generated QR code image
        });

        res.status(201).json({
            success: true,
            message: 'QR stage created successfully with scannable QR code',
            data: { stage },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update QR stage
 * @route   PATCH /api/admin/qr/:id
 * @access  Admin
 */
const updateQRStage = async (req, res, next) => {
    try {
        const { hint, pointsForCorrect, pointsForWrong, active, description, location } = req.body;

        const stage = await QRStage.findById(req.params.id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: 'QR stage not found',
            });
        }

        // Update fields if provided
        if (hint !== undefined) stage.hint = hint;
        if (pointsForCorrect !== undefined) stage.pointsForCorrect = pointsForCorrect;
        if (pointsForWrong !== undefined) stage.pointsForWrong = pointsForWrong;
        if (active !== undefined) stage.active = active;
        if (description !== undefined) stage.description = description;
        if (location !== undefined) stage.location = location;

        await stage.save();

        res.json({
            success: true,
            message: 'QR stage updated successfully',
            data: { stage },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete QR stage
 * @route   DELETE /api/admin/qr/:id
 * @access  Admin
 */
const deleteQRStage = async (req, res, next) => {
    try {
        const stage = await QRStage.findByIdAndDelete(req.params.id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: 'QR stage not found',
            });
        }

        res.json({
            success: true,
            message: 'QR stage deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const totalTeams = await Team.countDocuments();
        const activeTeams = await Team.countDocuments({ isActive: true });
        const totalStages = await QRStage.countDocuments();
        const activeStages = await QRStage.countDocuments({ active: true });
        const totalScans = await ScanLog.countDocuments();

        // Scan analytics
        const scanAnalytics = await ScanLog.getAnalytics();

        // Top teams
        const topTeams = await Team.find({ isActive: true })
            .select('teamName points members hintLog wrongScans')
            .sort({ points: -1 })
            .limit(5)
            .lean();

        // Recent scans
        const recentScans = await ScanLog.find()
            .sort({ scannedAt: -1 })
            .limit(10)
            .lean();

        res.json({
            success: true,
            data: {
                stats: {
                    totalTeams,
                    activeTeams,
                    totalStages,
                    activeStages,
                    totalScans,
                },
                scanAnalytics,
                topTeams,
                recentScans,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset event (scores, stages, or full reset)
 * @route   POST /api/admin/reset
 * @access  Admin
 */
const resetEvent = async (req, res, next) => {
    try {
        const { type } = req.body; // 'scores', 'stages', 'full'

        switch (type) {
            case 'scores':
                await ScoreService.resetAllScores();
                res.json({
                    success: true,
                    message: 'All team scores have been reset to 0',
                });
                break;

            case 'stages':
                res.json({
                    success: true,
                    message: 'Stage reset skipped (stage-based flow deprecated).',
                });
                break;

            case 'full':
                await Team.updateMany({}, {
                    points: 0,
                    currentHintId: null,
                    hintLog: [],
                    scannedQRs: [],
                    wrongScans: 0,
                    lastScanAt: null,
                });
                await ScanLog.deleteMany({});
                res.json({
                    success: true,
                    message: 'Full event reset completed. All scores, stages, and scan logs cleared.',
                });
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reset type. Use "scores", "stages", or "full"',
                });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all scan logs
 * @route   GET /api/admin/scans
 * @access  Admin
 */
const getAllScans = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const scans = await ScanLog.find()
            .sort({ scannedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await ScanLog.countDocuments();

        res.json({
            success: true,
            data: {
                scans,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// HINT MANAGEMENT (NEW GAME FLOW)
// ============================================

/**
 * @desc    Get all hints
 * @route   GET /api/admin/hints
 * @access  Admin
 */
const getAllHints = async (req, res, next) => {
    try {
        const hints = await Hint.find().sort({ hintId: 1 });

        res.json({
            success: true,
            count: hints.length,
            data: { hints },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new hint
 * @route   POST /api/admin/hints
 * @access  Admin
 */
const createHint = async (req, res, next) => {
    try {
        const { hintId, text, qrId, points, hintType, difficulty } = req.body;

        if (!hintId || !text || !qrId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields (hintId, text, qrId)',
            });
        }

        const hint = await Hint.create({
            hintId: hintId.toUpperCase(),
            text,
            qrId: qrId.toUpperCase(),
            points: points || 10,
            hintType: hintType || 'text',
            difficulty: difficulty || 'medium',
            active: true,
        });

        res.status(201).json({
            success: true,
            message: 'Hint created successfully',
            data: { hint },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update hint
 * @route   PATCH /api/admin/hints/:id
 * @access  Admin
 */
const updateHint = async (req, res, next) => {
    try {
        const { text, qrId, points, hintType, difficulty, active } = req.body;

        const hint = await Hint.findById(req.params.id);

        if (!hint) {
            return res.status(404).json({
                success: false,
                message: 'Hint not found',
            });
        }

        // Update fields if provided
        if (text !== undefined) hint.text = text;
        if (qrId !== undefined) hint.qrId = qrId.toUpperCase();
        if (points !== undefined) hint.points = points;
        if (hintType !== undefined) hint.hintType = hintType;
        if (difficulty !== undefined) hint.difficulty = difficulty;
        if (active !== undefined) hint.active = active;

        await hint.save();

        res.json({
            success: true,
            message: 'Hint updated successfully',
            data: { hint },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete hint
 * @route   DELETE /api/admin/hints/:id
 * @access  Admin
 */
const deleteHint = async (req, res, next) => {
    try {
        const hint = await Hint.findByIdAndDelete(req.params.id);

        if (!hint) {
            return res.status(404).json({
                success: false,
                message: 'Hint not found',
            });
        }

        res.json({
            success: true,
            message: 'Hint deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get hint by ID
 * @route   GET /api/admin/hints/:id
 * @access  Admin
 */
const getHintById = async (req, res, next) => {
    try {
        const hint = await Hint.findById(req.params.id);

        if (!hint) {
            return res.status(404).json({
                success: false,
                message: 'Hint not found',
            });
        }

        res.json({
            success: true,
            data: { hint },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get QR codes with images for display
 * @route   GET /api/admin/qr-images
 * @access  Admin
 */
const getQRCodesWithImages = async (req, res, next) => {
    try {
        const qrStages = await QRStage.find().sort({ stageIndex: 1 });

        // Format response with QR code images
        const qrCodesData = qrStages.map(qr => ({
            _id: qr._id,
            code: qr.code,
            locationName: qr.locationName,
            isStartQR: qr.isStartQR,
            linkedHintId: qr.linkedHintId,
            points: qr.points,
            active: qr.active,
            scanCount: qr.scanCount,
            qrCodeImage: qr.qrCodeImage, // Base64 data URL
            stageIndex: qr.stageIndex,
            createdAt: qr.createdAt,
        }));

        res.json({
            success: true,
            count: qrCodesData.length,
            data: { qrCodes: qrCodesData },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Regenerate QR code image for a specific QR stage
 * @route   POST /api/admin/qr/:id/regenerate
 * @access  Admin
 */
const regenerateQRCode = async (req, res, next) => {
    try {
        const qrStage = await QRStage.findById(req.params.id);

        if (!qrStage) {
            return res.status(404).json({
                success: false,
                message: 'QR stage not found',
            });
        }

        // Generate new QR code image
        const qrCodeImage = await QRCode.toDataURL(qrStage.code, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        qrStage.qrCodeImage = qrCodeImage;
        await qrStage.save();

        res.json({
            success: true,
            message: 'QR code regenerated successfully',
            data: { qrStage },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download QR code as PNG
 * @route   GET /api/admin/qr/:id/download
 * @access  Admin
 */
const downloadQRCode = async (req, res, next) => {
    try {
        const qrStage = await QRStage.findById(req.params.id);

        if (!qrStage) {
            return res.status(404).json({
                success: false,
                message: 'QR stage not found',
            });
        }

        if (!qrStage.qrCodeImage) {
            return res.status(404).json({
                success: false,
                message: 'QR code image not found. Please regenerate.',
            });
        }

        // Convert base64 to buffer
        const base64Data = qrStage.qrCodeImage.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Set response headers for download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${qrStage.code}.png"`);
        res.send(imageBuffer);
    } catch (error) {
        next(error);
    }
};

// ============================================
// EVENT CONTROL (NEW)
// ============================================

/**
 * @desc    Get current event settings
 * @route   GET /api/admin/event/settings
 * @access  Admin
 */
const getEventSettings = async (req, res, next) => {
    try {
        const settings = await EventSettings.getSettings();

        res.json({
            success: true,
            data: { settings },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Start the event
 * @route   POST /api/admin/event/start
 * @access  Admin
 */
const startEvent = async (req, res, next) => {
    try {
        const adminName = req.body.adminName || 'admin';

        const settings = await EventSettings.getSettings();

        if (settings.eventStatus === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Event is already active',
            });
        }

        await EventSettings.updateStatus('active', adminName);

        res.json({
            success: true,
            message: 'Event started successfully! Teams can now scan QR codes.',
            data: {
                eventStatus: 'active',
                startedAt: new Date(),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    End the event
 * @route   POST /api/admin/event/end
 * @access  Admin
 */
const endEvent = async (req, res, next) => {
    try {
        const adminName = req.body.adminName || 'admin';

        const settings = await EventSettings.getSettings();

        if (settings.eventStatus === 'ended') {
            return res.status(400).json({
                success: false,
                message: 'Event is already ended',
            });
        }

        await EventSettings.updateStatus('ended', adminName);

        res.json({
            success: true,
            message: 'Event ended successfully! No further scans are allowed.',
            data: {
                eventStatus: 'ended',
                endedAt: new Date(),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update event settings
 * @route   PATCH /api/admin/event/settings
 * @access  Admin
 */
const updateEventSettings = async (req, res, next) => {
    try {
        const { eventName, eventDescription } = req.body;

        const settings = await EventSettings.getSettings();

        if (eventName !== undefined) settings.eventName = eventName;
        if (eventDescription !== undefined) settings.eventDescription = eventDescription;

        await settings.save();

        res.json({
            success: true,
            message: 'Event settings updated successfully',
            data: { settings },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// TEAM ELIMINATION (NEW)
// ============================================

/**
 * @desc    Eliminate a team
 * @route   POST /api/admin/team/:id/eliminate
 * @access  Admin
 */
const eliminateTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        if (!team.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Team is already eliminated',
            });
        }

        team.isActive = false;
        await team.save();

        res.json({
            success: true,
            message: `Team "${team.teamName}" has been eliminated`,
            data: { team },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reactivate an eliminated team
 * @route   POST /api/admin/team/:id/reactivate
 * @access  Admin
 */
const reactivateTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        if (team.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Team is already active',
            });
        }

        team.isActive = true;
        await team.save();

        res.json({
            success: true,
            message: `Team "${team.teamName}" has been reactivated`,
            data: { team },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// REJOIN QR MANAGEMENT (NEW)
// ============================================

/**
 * @desc    Get all rejoin QR codes
 * @route   GET /api/admin/rejoin-qr
 * @access  Admin
 */
const getAllRejoinQRs = async (req, res, next) => {
    try {
        const rejoinQRs = await RejoinQR.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: rejoinQRs.length,
            data: { rejoinQRs },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new rejoin QR
 * @route   POST /api/admin/rejoin-qr
 * @access  Admin
 */
const createRejoinQR = async (req, res, next) => {
    try {
        const {
            code,
            name,
            description,
            maxUsageCount,
            expiresAt,
            pointsAdjustment,
            createdBy,
        } = req.body;

        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Code and name are required',
            });
        }

        // Generate QR code image
        const qrCodeImage = await QRCode.toDataURL(code.toUpperCase(), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        const rejoinQR = await RejoinQR.create({
            code: code.toUpperCase(),
            name,
            description: description || '',
            maxUsageCount: maxUsageCount || 1,
            expiresAt: expiresAt || null,
            pointsAdjustment: pointsAdjustment || 0,
            createdBy: createdBy || 'admin',
            qrCodeImage,
        });

        res.status(201).json({
            success: true,
            message: 'Rejoin QR created successfully',
            data: { rejoinQR },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Rejoin QR code already exists',
            });
        }
        next(error);
    }
};

/**
 * @desc    Update rejoin QR
 * @route   PATCH /api/admin/rejoin-qr/:id
 * @access  Admin
 */
const updateRejoinQR = async (req, res, next) => {
    try {
        const {
            name,
            description,
            maxUsageCount,
            active,
            expiresAt,
            pointsAdjustment,
        } = req.body;

        const rejoinQR = await RejoinQR.findById(req.params.id);

        if (!rejoinQR) {
            return res.status(404).json({
                success: false,
                message: 'Rejoin QR not found',
            });
        }

        // Update fields if provided
        if (name !== undefined) rejoinQR.name = name;
        if (description !== undefined) rejoinQR.description = description;
        if (maxUsageCount !== undefined) rejoinQR.maxUsageCount = maxUsageCount;
        if (active !== undefined) rejoinQR.active = active;
        if (expiresAt !== undefined) rejoinQR.expiresAt = expiresAt;
        if (pointsAdjustment !== undefined) rejoinQR.pointsAdjustment = pointsAdjustment;

        await rejoinQR.save();

        res.json({
            success: true,
            message: 'Rejoin QR updated successfully',
            data: { rejoinQR },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete rejoin QR
 * @route   DELETE /api/admin/rejoin-qr/:id
 * @access  Admin
 */
const deleteRejoinQR = async (req, res, next) => {
    try {
        const rejoinQR = await RejoinQR.findByIdAndDelete(req.params.id);

        if (!rejoinQR) {
            return res.status(404).json({
                success: false,
                message: 'Rejoin QR not found',
            });
        }

        res.json({
            success: true,
            message: 'Rejoin QR deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get rejoin QR by ID
 * @route   GET /api/admin/rejoin-qr/:id
 * @access  Admin
 */
const getRejoinQRById = async (req, res, next) => {
    try {
        const rejoinQR = await RejoinQR.findById(req.params.id);

        if (!rejoinQR) {
            return res.status(404).json({
                success: false,
                message: 'Rejoin QR not found',
            });
        }

        res.json({
            success: true,
            data: { rejoinQR },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
