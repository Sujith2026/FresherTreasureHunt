const Team = require('../models/Team');
const ScoreService = require('../services/scoreService');

/**
 * @desc    Get leaderboard
 * @route   GET /api/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const teams = await Team.getLeaderboard();

        // Add rank to each team
        const leaderboard = teams.map((team, index) => ({
            rank: index + 1,
            teamId: team._id,
            teamName: team.teamName,
            points: team.points,
            completedHints: Array.isArray(team.hintLog)
                ? team.hintLog.filter((h) => h.status === 'completed').length
                : 0,
            wrongScans: team.wrongScans || 0,
            memberCount: team.members.length,
            lastScanAt: team.lastScanAt,
        }));

        res.json({
            success: true,
            count: leaderboard.length,
            data: { leaderboard },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get team rank
 * @route   GET /api/leaderboard/rank
 * @access  Private
 */
const getTeamRank = async (req, res, next) => {
    try {
        const team = req.team;
        const rank = await ScoreService.getTeamRank(team._id);

        res.json({
            success: true,
            data: {
                rank,
                teamName: team.teamName,
                points: team.points,
                completedHints: Array.isArray(team.hintLog)
                    ? team.hintLog.filter((h) => h.status === 'completed').length
                    : 0,
                wrongScans: team.wrongScans || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeaderboard,
    getTeamRank,
};
