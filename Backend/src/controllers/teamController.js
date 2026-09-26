const TeamService = require('../services/teamService');

/**
 * @desc    Add member to team
 * @route   POST /api/team/add-member
 * @access  Private
 */
const addMember = async (req, res, next) => {
    try {
        const team = req.team;
        const { name, email, role } = req.body;

        const result = await TeamService.addMember(team._id, {
            name,
            email,
            role: role || 'member',
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove member from team
 * @route   DELETE /api/team/remove-member/:memberId
 * @access  Private
 */
const removeMember = async (req, res, next) => {
    try {
        const team = req.team;
        const { memberId } = req.params;

        const result = await TeamService.removeMember(team._id, memberId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get team details
 * @route   GET /api/team
 * @access  Private
 */
const getTeamDetails = async (req, res, next) => {
    try {
        const team = await TeamService.getTeamDetails(req.team._id);

        res.json({
            success: true,
            data: { team },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addMember,
    removeMember,
    getTeamDetails,
};
