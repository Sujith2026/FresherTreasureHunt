const Team = require('../models/Team');

class TeamService {
    /**
     * Add member to team
     * @param {ObjectId} teamId - Team ID
     * @param {Object} memberData - Member information
     * @returns {Promise<Object>} - Updated team
     */
    static async addMember(teamId, memberData) {
        const team = await Team.findById(teamId);

        if (!team) {
            throw new Error('Team not found');
        }

        // Check if member limit reached
        if (team.members.length >= 10) {
            throw new Error('Team has reached maximum member limit (10)');
        }

        // Check if email already exists in team
        const emailExists = team.members.some(
            (member) => member.email === memberData.email.toLowerCase()
        );

        if (emailExists) {
            throw new Error('A member with this email already exists in the team');
        }

        // Add member
        team.members.push({
            name: memberData.name,
            email: memberData.email.toLowerCase(),
            role: memberData.role || 'member',
        });

        await team.save();

        return {
            success: true,
            message: 'Member added successfully',
            team: {
                id: team._id,
                teamName: team.teamName,
                members: team.members,
            },
        };
    }

    /**
     * Remove member from team
     * @param {ObjectId} teamId - Team ID
     * @param {ObjectId} memberId - Member ID
     * @returns {Promise<Object>} - Updated team
     */
    static async removeMember(teamId, memberId) {
        const team = await Team.findById(teamId);

        if (!team) {
            throw new Error('Team not found');
        }

        const memberIndex = team.members.findIndex(
            (m) => m._id.toString() === memberId.toString()
        );

        if (memberIndex === -1) {
            throw new Error('Member not found in team');
        }

        // Don't allow removing the last leader
        const member = team.members[memberIndex];
        if (member.role === 'leader') {
            const leaderCount = team.members.filter((m) => m.role === 'leader').length;
            if (leaderCount <= 1) {
                throw new Error('Cannot remove the last leader from the team');
            }
        }

        team.members.splice(memberIndex, 1);
        await team.save();

        return {
            success: true,
            message: 'Member removed successfully',
            team: {
                id: team._id,
                teamName: team.teamName,
                members: team.members,
            },
        };
    }

    /**
     * Update member role
     * @param {ObjectId} teamId - Team ID
     * @param {ObjectId} memberId - Member ID
     * @param {String} newRole - New role
     * @returns {Promise<Object>} - Updated team
     */
    static async updateMemberRole(teamId, memberId, newRole) {
        const team = await Team.findById(teamId);

        if (!team) {
            throw new Error('Team not found');
        }

        const member = team.members.id(memberId);

        if (!member) {
            throw new Error('Member not found in team');
        }

        member.role = newRole;
        await team.save();

        return {
            success: true,
            message: 'Member role updated successfully',
            member,
        };
    }

    /**
     * Get team details with members
     * @param {ObjectId} teamId - Team ID
     * @returns {Promise<Object>} - Team details
     */
    static async getTeamDetails(teamId) {
        const team = await Team.findById(teamId).select('-passwordHash');

        if (!team) {
            throw new Error('Team not found');
        }

        return team;
    }

    /**
     * Find member in team
     * @param {ObjectId} teamId - Team ID
     * @param {ObjectId} memberId - Member ID
     * @returns {Promise<Object>} - Member object
     */
    static async findMember(teamId, memberId) {
        const team = await Team.findById(teamId);

        if (!team) {
            throw new Error('Team not found');
        }

        const member = team.members.id(memberId);

        if (!member) {
            throw new Error('Member not found in team');
        }

        return { team, member };
    }
}

module.exports = TeamService;
