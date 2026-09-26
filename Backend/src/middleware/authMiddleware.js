const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.',
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if team still exists
        const team = await Team.findById(decoded.teamId).select('-passwordHash');

        if (!team) {
            return res.status(401).json({
                success: false,
                message: 'Team not found. Authorization denied.',
            });
        }

        if (!team.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Team is inactive. Contact administrator.',
            });
        }

        // Attach team to request
        req.team = team;
        req.teamId = team._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Authorization denied.',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};

module.exports = authMiddleware;
