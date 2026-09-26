const Team = require('../models/Team');
// const pointsConfig = require('../config/pointsConfig.json'); // Deprecated with stage-based flow

class ScoreService {
    // Stage-based helpers retained for reference only. Uncomment if legacy flow is reinstated.
    // static async addPoints(teamId, points) { ... }
    // static async deductPoints(teamId, points) { ... }
    // static async applyCorrectScan(team, qrStage) { ... }
    // static async applyWrongScan(team, qrStage) { ... }
    // static async handleDuplicateScan(team) { ... }
    // static async handleSkippedStage(team) { ... }
    // static async applyScanReward(team, qrStage) { ... }

    /**
     * Reset all team scores
     */
    static async resetAllScores() {
        await Team.updateMany({}, {
            points: 0,
            currentHintId: null,
            hintLog: [],
            scannedQRs: [],
            wrongScans: 0,
            lastScanAt: null,
        });
        return { success: true, message: 'All team scores have been reset' };
    }

    /**
     * Get team ranking
     * @param {ObjectId} teamId - Team ID
     * @returns {Number} - Team rank
     */
    static async getTeamRank(teamId) {
        const team = await Team.findById(teamId).select('points lastScanAt isActive');
        if (!team) return null;

        const rank = await Team.countDocuments({
            isActive: true,
            $or: [
                { points: { $gt: team.points } },
                {
                    points: team.points,
                    lastScanAt: {
                        $lt: team.lastScanAt || new Date(0),
                    },
                },
            ],
        });

        return rank + 1;
    }
}

module.exports = ScoreService;
