const QRStage = require('../models/QRStage');
const ScanLog = require('../models/ScanLog');
const ScoreService = require('../services/scoreService');
const lockHelper = require('../utils/lockHelper');
// const pointsConfig = require('../config/pointsConfig.json'); // Not used in this function

/**
 * @desc    Scan a QR code and get a next hint
 * @route   POST /api/scan
 * @access  Private
 */
const scanQR = async (req, res, next) => {
  try {
    const { qrCode, memberId, memberName } = req.body;
    const team = req.team;
    const lockKey = `scan:team:${team._id}`;

    console.log('--- SCAN DEBUG ---');
    console.log('Scanned qrCode:', qrCode);
    console.log('Team:', team ? { _id: team._id, teamName: team.teamName } : null);

    // Use lock to prevent multiple simultaneous scans
    const result = await lockHelper.withLock(lockKey, async () => {
      // Find QR by its code
      const qrHint = await QRStage.findOne({ code: qrCode, active: true });

      if (!qrHint) {
        // ... (Your error logging for "QR not found" is correct) ...
        return {
          success: false,
          message: 'QR code not found or inactive',
        };
      }

      // Check for duplicate scan
      const alreadyScanned = team.scannedHints.includes(qrHint.code);
      if (alreadyScanned) {
        return {
          success: false,
          message: 'You have already scanned this QR code!',
          alreadyScanned: true,
        };
      }

      // -----------------------------------------------------------------
      // 🎯 START: PROGRESSIVE RANDOM HINT LOGIC
      // -----------------------------------------------------------------

      let nextHint = null;
      let nextHintId = null; // Format: "QR_CODE:HINT_INDEX"

      // 1. Get all active QR stages with their hints
      const allActiveQRs = await QRStage.find({ active: true }, 'code hints');

      // 2. Flatten all hints into a single pool with unique identifiers
      const allHintsPool = [];
      allActiveQRs.forEach((qr) => {
        qr.hints.forEach((hintObj) => {
          allHintsPool.push({
            id: `${qr.code}:${hintObj.index}`, // Unique identifier
            qrCode: qr.code,
            hintText: hintObj.hint,
            index: hintObj.index,
          });
        });
      });

      // 3. Filter out hints that have already been given to this team
      const remainingHints = allHintsPool.filter(
        (hint) => !team.hintsGiven.includes(hint.id)
      );

      if (remainingHints.length === 0) {
        // All hints have been given!
        nextHint = "Congratulations! You have discovered all the hints!";
        nextHintId = 'COMPLETED';
      } else {
        // 4. Pick a random hint from the remaining pool
        const randomIndex = Math.floor(Math.random() * remainingHints.length);
        const selectedHint = remainingHints[randomIndex];

        nextHint = selectedHint.hintText;
        nextHintId = selectedHint.id;
      }

      // -----------------------------------------------------------------
      // 🎯 END: PROGRESSIVE RANDOM HINT LOGIC
      // -----------------------------------------------------------------

      // Apply points for valid scan (based on current scanCount)
      const scanResult = await ScoreService.applyScanReward(team, qrHint);

      // Mark this QR as scanned (track QR codes)
      if (!team.scannedHints.includes(qrHint.code)) {
        team.scannedHints.push(qrHint.code);
      }

      // Track the specific hint that was given
      if (nextHintId && nextHintId !== 'COMPLETED') {
        team.hintsGiven.push(nextHintId);
      }

      // Save all team changes at once
      await team.save();

      // 🎯 INCREMENT QR SCAN COUNT AFTER AWARDING POINTS
      // This ensures the next team gets fewer points
      qrHint.scanCount += 1;
      await qrHint.save();

      // Log successful scan
      await ScanLog.create({
        teamId: team._id,
        teamName: team.teamName,
        memberId,
        memberName,
        qrCode,
        result: 'accepted',
        pointsDelta: scanResult.pointsAwarded, // Actual points awarded (dynamic)
        totalPointsAfter: team.points,
        message: scanResult.message,
        ipAddress: req.ip,
        stageIndex: typeof qrHint?.stageIndex === 'number' ? qrHint.stageIndex : null,
        teamStageAtScan: typeof team?.currentStage === 'number' ? team.currentStage : null,
      });

      return {
        success: true,
        message: scanResult.message,
        pointsAwarded: scanResult.pointsAwarded, // Dynamic points
        scanPosition: scanResult.scanPosition, // 1st, 2nd, 3rd, etc.
        team: {
          points: team.points,
          scannedHints: team.scannedHints,
          totalHintsGiven: team.hintsGiven.length,
        },
        hintType: 'text',
        hintValue: nextHint, // The random hint from remaining pool
        hintId: nextHintId, // The unique hint identifier
      };
    });

    res.json(result);
  } catch (error) {
    if (error.message.includes('Failed to acquire lock')) {
      return res.status(429).json({
        success: false,
        message: 'Too many scan attempts. Please wait a moment and try again.',
      });
    }
    next(error);
  }
};


const getScanHistory = async (req, res, next) => {
  try {
    const team = req.team;
    const limit = parseInt(req.query.limit) || 50;

    const history = await ScanLog.getTeamHistory(team._id, limit);

    res.json({
      success: true,
      count: history.length,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanQR,
  getScanHistory,
};