const Hint = require('../models/Hint');
const QRStage = require('../models/QRStage');
const Team = require('../models/Team');
const ScanLog = require('../models/ScanLog');
const EventSettings = require('../models/EventSettings');
const RejoinQR = require('../models/RejoinQR');
const lockHelper = require('../utils/lockHelper');
const pointsConfig = require('../config/pointsConfig.json');

const ensureTeamGameState = (team) => {
    if (!Array.isArray(team.scannedQRs)) {
        team.scannedQRs = [];
    }
    if (!Array.isArray(team.hintLog)) {
        team.hintLog = [];
    }
    if (typeof team.wrongScans !== 'number') {
        team.wrongScans = 0;
    }
};

/**
 * @desc    Start the game - Scan Start QR to get first hint
 * @route   POST /api/game/start
 * @access  Private
 */
const startGame = async (req, res, next) => {
    try {
        const { qrId } = req.body;
        const team = req.team;
        const lockKey = `game:start:team:${team._id}`;

        // Validate input
        if (!qrId) {
            return res.status(400).json({
                success: false,
                message: 'QR ID is required',
            });
        }

        const result = await lockHelper.withLock(lockKey, async () => {
            // 0. Check event status - only check if ended
            const eventSettings = await EventSettings.getSettings();

            if (eventSettings.eventStatus === 'ended') {
                return {
                    success: false,
                    message: 'The event has ended. No further scans are allowed.',
                    eventStatus: 'ended',
                };
            }

            // Check if team is eliminated
            if (!team.isActive) {
                return {
                    success: false,
                    message: 'You have been eliminated from the event. Scan a rejoin QR to continue.',
                    eliminated: true,
                };
            }

            ensureTeamGameState(team);

            // 1. Verify this is a Start QR
            const qrCode = await QRStage.findOne({
                code: qrId.toUpperCase(),
                isStartQR: true,
                active: true,
            });

            if (!qrCode) {
                return {
                    success: false,
                    message: 'Invalid Start QR code. Please scan the correct starting point.',
                };
            }

            // 2. Check if team already started (has currentHintId)
            if (team.currentHintId) {
                return {
                    success: false,
                    message: 'Game already started. Follow your current hint.',
                    currentHint: team.hintLog.find(h => h.status === 'active'),
                };
            }

            // 3. Get a random unused hint for this team
            const randomHint = await Hint.getRandomUnusedHint(team._id.toString());

            if (!randomHint) {
                return {
                    success: false,
                    message: 'No hints available. Please contact admin.',
                };
            }

            // 4. Assign hint to team
            team.currentHintId = randomHint.hintId;
            team.scannedQRs.push(qrId.toUpperCase());
            team.hintLog.push({
                hintId: randomHint.hintId,
                hintText: randomHint.text,
                hintType: randomHint.hintType || 'text',
                status: 'active',
                qrScanned: qrId.toUpperCase(),
                pointsEarned: 0,
                timestamp: new Date(),
            });

            await team.save();

            // 5. Mark hint as used by this team
            await Hint.findOneAndUpdate(
                { hintId: randomHint.hintId },
                { $addToSet: { usedByTeams: team._id.toString() } }
            );

            // 6. Log the start
            await ScanLog.create({
                teamId: team._id,
                teamName: team.teamName,
                qrCode: qrId.toUpperCase(),
                result: 'accepted',
                pointsDelta: 0,
                totalPointsAfter: team.points,
                message: 'Game started',
                isCorrectQR: true,
                actualQrId: qrId.toUpperCase(),
                hintGiven: {
                    hintId: randomHint.hintId,
                    hintText: randomHint.text,
                },
                stageIndex: typeof qrCode?.stageIndex === 'number' ? qrCode.stageIndex : null,
                teamStageAtScan: team.hintLog.filter(h => h.status === 'completed').length,
                scannedAt: new Date(),
            });

            return {
                success: true,
                message: 'Game started! Follow the hint to find your next QR code.',
                hint: {
                    id: randomHint.hintId,
                    text: randomHint.text,
                    type: randomHint.hintType || 'text',
                },
                // For frontend compatibility
                hintType: randomHint.hintType || 'text',
                hintValue: randomHint.text,
                pointsAwarded: 0,
                team: {
                    points: team.points,
                    currentHintId: team.currentHintId,
                    hintsCollected: team.hintLog.length,
                },
            };
        });

        res.json(result);
    } catch (error) {
        if (error.message.includes('Failed to acquire lock')) {
            return res.status(429).json({
                success: false,
                message: 'Please wait a moment before trying again.',
            });
        }
        next(error);
    }
};

/**
 * @desc    Scan QR code during game
 * @route   POST /api/game/scan
 * @access  Private
 */
const scanQR = async (req, res, next) => {
    try {
        const { qrId } = req.body;
        const team = req.team;
        const lockKey = `game:scan:team:${team._id}`;

        // Validate input
        if (!qrId) {
            return res.status(400).json({
                success: false,
                message: 'QR ID is required',
            });
        }

        const result = await lockHelper.withLock(lockKey, async () => {
            // 0. Check event status - only check if ended
            const eventSettings = await EventSettings.getSettings();

            if (eventSettings.eventStatus === 'ended') {
                return {
                    success: false,
                    message: 'The event has ended. No further scans are allowed.',
                    eventStatus: 'ended',
                };
            }

            // Check if team is eliminated
            if (!team.isActive) {
                return {
                    success: false,
                    message: 'You have been eliminated from the event. Scan a rejoin QR to continue.',
                    eliminated: true,
                };
            }

            ensureTeamGameState(team);

            const normalizedQrId = qrId.toUpperCase();

            // 1. Check if team has started the game
            if (!team.currentHintId) {
                return {
                    success: false,
                    message: 'Game not started. Please scan the Start QR first.',
                };
            }

            // 2. Find the QR code
            const qrCode = await QRStage.findOne({
                code: normalizedQrId,
                active: true,
            });

            if (!qrCode) {
                return {
                    success: false,
                    message: 'QR code not found or inactive.',
                };
            }

            // 3. Check if already scanned this QR
            if (team.scannedQRs.includes(normalizedQrId)) {
                return {
                    success: false,
                    message: 'You have already scanned this QR code.',
                    alreadyScanned: true,
                };
            }

            // 4. Get current hint
            const currentHint = await Hint.findOne({ hintId: team.currentHintId });

            if (!currentHint) {
                return {
                    success: false,
                    message: 'Current hint not found. Please contact admin.',
                };
            }

            // 5. Check if this is the CORRECT QR (matches current hint)
            const isCorrectQR = currentHint.qrId === normalizedQrId;

            // 6a. CORRECT QR - Award points and give next hint
            if (isCorrectQR) {
                // Award points
                const pointsToAward = currentHint.points || 10;
                team.points += pointsToAward;

                // Mark current hint as completed in hintLog
                const currentHintLog = team.hintLog.find(
                    h => h.hintId === team.currentHintId && h.status === 'active'
                );
                if (currentHintLog) {
                    currentHintLog.status = 'completed';
                    currentHintLog.qrScanned = normalizedQrId;
                    currentHintLog.pointsEarned = pointsToAward;
                }

                // Add to scanned QRs
                team.scannedQRs.push(normalizedQrId);
                team.lastScanAt = new Date();

                // Get next hint (random unused)
                const nextHint = await Hint.getRandomUnusedHint(team._id.toString());

                let nextHintData = null;
                let gameCompleted = false;

                if (nextHint) {
                    // Assign next hint
                    team.currentHintId = nextHint.hintId;
                    team.hintLog.push({
                        hintId: nextHint.hintId,
                        hintText: nextHint.text,
                        hintType: nextHint.hintType || 'text',
                        status: 'active',
                        qrScanned: null,
                        pointsEarned: 0,
                        timestamp: new Date(),
                    });

                    // Mark hint as used
                    await Hint.findOneAndUpdate(
                        { hintId: nextHint.hintId },
                        { $addToSet: { usedByTeams: team._id.toString() } }
                    );

                    nextHintData = {
                        id: nextHint.hintId,
                        text: nextHint.text,
                        type: nextHint.hintType || 'text',
                    };
                } else {
                    // No more hints - game completed!
                    team.currentHintId = null;
                    gameCompleted = true;
                }

                await team.save();

                // Log successful scan
                await ScanLog.create({
                    teamId: team._id,
                    teamName: team.teamName,
                    qrCode: normalizedQrId,
                    result: 'accepted',
                    pointsDelta: pointsToAward,
                    totalPointsAfter: team.points,
                    message: `Correct QR! +${pointsToAward} points`,
                    isCorrectQR: true,
                    expectedQrId: currentHint.qrId,
                    actualQrId: normalizedQrId,
                    hintGiven: nextHintData ? {
                        hintId: nextHintData.id,
                        hintText: nextHintData.text,
                    } : null,
                    stageIndex: typeof qrCode?.stageIndex === 'number' ? qrCode.stageIndex : null,
                    teamStageAtScan: team.hintLog.filter(h => h.status === 'completed').length,
                    scannedAt: new Date(),
                });

                return {
                    success: true,
                    status: 'correct',
                    message: `Correct! You earned ${pointsToAward} points.`,
                    pointsAwarded: pointsToAward,
                    team: {
                        points: team.points,
                        hintsCompleted: team.hintLog.filter(h => h.status === 'completed').length,
                        totalHints: team.hintLog.length,
                    },
                    nextHint: nextHintData,
                    // For frontend compatibility
                    hintType: nextHintData ? nextHintData.type : null,
                    hintValue: nextHintData ? nextHintData.text : null,
                    gameCompleted,
                    completionMessage: gameCompleted ? 'Congratulations! You have completed the treasure hunt!' : null,
                };
            }

            // 6b. WRONG QR - Deduct penalty
            else {
                const penalty = pointsConfig.gameplay?.wrongQRPenalty ?? 20;
                team.points = Math.max(0, team.points - penalty);
                team.wrongScans += 1;

                // Log wrong scan in hintLog
                team.hintLog.push({
                    hintId: team.currentHintId,
                    hintText: currentHint.text,
                    hintType: currentHint.hintType || 'text',
                    status: 'wrong',
                    qrScanned: normalizedQrId,
                    pointsEarned: -penalty,
                    timestamp: new Date(),
                });

                await team.save();

                // Log failed scan
                await ScanLog.create({
                    teamId: team._id,
                    teamName: team.teamName,
                    qrCode: normalizedQrId,
                    result: 'rejected',
                    pointsDelta: -penalty,
                    totalPointsAfter: team.points,
                    message: `Wrong QR! -${penalty} points`,
                    isCorrectQR: false,
                    expectedQrId: currentHint.qrId,
                    actualQrId: normalizedQrId,
                    stageIndex: typeof qrCode?.stageIndex === 'number' ? qrCode.stageIndex : null,
                    teamStageAtScan: team.hintLog.filter(h => h.status === 'completed').length,
                    scannedAt: new Date(),
                });

                return {
                    success: false,
                    status: 'wrong',
                    message: `Wrong QR code! You lost ${penalty} points. Follow your current hint.`,
                    pointsDeducted: penalty,
                    team: {
                        points: team.points,
                        wrongScans: team.wrongScans,
                    },
                    currentHint: {
                        id: currentHint.hintId,
                        text: currentHint.text,
                        type: currentHint.hintType || 'text',
                    },
                    hintType: currentHint.hintType || 'text',
                    hintValue: currentHint.text,
                };
            }
        });

        res.json(result);
    } catch (error) {
        if (error.message.includes('Failed to acquire lock')) {
            return res.status(429).json({
                success: false,
                message: 'Please wait a moment before trying again.',
            });
        }
        next(error);
    }
};

/**
 * @desc    Get team's hint logs and game progress
 * @route   GET /api/game/logs
 * @access  Private
 */
const getGameLogs = async (req, res, next) => {
    try {
        const team = req.team;

        // Get current active hint
        const currentHint = team.hintLog.find(h => h.status === 'active');
        const currentHintType = currentHint?.hintType || 'text';

        // Calculate statistics
        const completedHints = team.hintLog.filter(h => h.status === 'completed').length;
        const wrongScans = team.hintLog.filter(h => h.status === 'wrong').length;

        res.json({
            success: true,
            data: {
                team: {
                    id: team._id,
                    name: team.teamName,
                    points: team.points,
                },
                currentHint: currentHint ? {
                    id: currentHint.hintId,
                    text: currentHint.hintText,
                    type: currentHintType,
                    receivedAt: currentHint.timestamp,
                } : null,
                progress: {
                    hintsCompleted: completedHints,
                    totalHints: team.hintLog.length,
                    wrongScans: wrongScans,
                    qrsScanned: team.scannedQRs.length,
                    gameCompleted: !team.currentHintId && completedHints > 0,
                },
                hintLog: team.hintLog.map(h => ({
                    hintId: h.hintId,
                    hintText: h.hintText,
                    status: h.status,
                    type: h.hintType || 'text',
                    qrScanned: h.qrScanned,
                    pointsEarned: h.pointsEarned,
                    timestamp: h.timestamp,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current hint (active hint for the team)
 * @route   GET /api/game/current-hint
 * @access  Private
 */
const getCurrentHint = async (req, res, next) => {
    try {
        const team = req.team;

        if (!team.currentHintId) {
            return res.json({
                success: true,
                message: 'No active hint. Game not started or completed.',
                currentHint: null,
            });
        }

        const currentHint = await Hint.findOne({ hintId: team.currentHintId });

        if (!currentHint) {
            return res.status(404).json({
                success: false,
                message: 'Current hint not found.',
            });
        }

        res.json({
            success: true,
            currentHint: {
                id: currentHint.hintId,
                text: currentHint.text,
                type: currentHint.hintType || 'text',
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Scan rejoin QR to rejoin the event after elimination
 * @route   POST /api/game/rejoin
 * @access  Private
 */
const scanRejoinQR = async (req, res, next) => {
    try {
        const { qrId } = req.body;
        const team = req.team;
        const lockKey = `rejoin:team:${team._id}`;

        // Validate input
        if (!qrId) {
            return res.status(400).json({
                success: false,
                message: 'QR ID is required',
            });
        }

        const result = await lockHelper.withLock(lockKey, async () => {
            const normalizedQrId = qrId.toUpperCase();

            // 1. Check if team is already active
            if (team.isActive) {
                return {
                    success: false,
                    message: 'Your team is already active in the event.',
                };
            }

            // 2. Find the rejoin QR
            const rejoinQR = await RejoinQR.findOne({ code: normalizedQrId });

            if (!rejoinQR) {
                return {
                    success: false,
                    message: 'Invalid rejoin QR code.',
                };
            }

            // 3. Validate the rejoin QR
            const validity = rejoinQR.isValid();
            if (!validity.valid) {
                return {
                    success: false,
                    message: validity.reason,
                };
            }

            // 4. Use the rejoin QR
            try {
                await rejoinQR.useForTeam(team._id, team.teamName);
            } catch (error) {
                return {
                    success: false,
                    message: error.message,
                };
            }

            // 5. Reactivate the team
            team.isActive = true;

            // 6. Apply points adjustment if any
            if (rejoinQR.pointsAdjustment !== 0) {
                team.points = Math.max(0, team.points + rejoinQR.pointsAdjustment);
            }

            await team.save();

            // 7. Log the rejoin
            await ScanLog.create({
                teamId: team._id,
                teamName: team.teamName,
                qrCode: normalizedQrId,
                result: 'accepted',
                pointsDelta: rejoinQR.pointsAdjustment,
                totalPointsAfter: team.points,
                message: 'Team rejoined via rejoin QR',
                isCorrectQR: true,
                actualQrId: normalizedQrId,
                scannedAt: new Date(),
            });

            return {
                success: true,
                message: 'Welcome back! You\'ve rejoined the event.',
                team: {
                    name: team.teamName,
                    points: team.points,
                    isActive: team.isActive,
                },
                pointsAdjustment: rejoinQR.pointsAdjustment,
                remainingUses: rejoinQR.maxUsageCount - rejoinQR.currentUsageCount,
            };
        });

        res.json(result);
    } catch (error) {
        if (error.message.includes('Failed to acquire lock')) {
            return res.status(429).json({
                success: false,
                message: 'Please wait a moment before trying again.',
            });
        }
        next(error);
    }
};

module.exports = {
    startGame,
    scanQR,
    getGameLogs,
    getCurrentHint,
    scanRejoinQR,
};
