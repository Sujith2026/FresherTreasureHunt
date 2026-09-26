const jwt = require('jsonwebtoken');

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Admin access denied.',
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an admin token
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required. Permission denied.',
            });
        }

        // Attach admin info to request
        req.admin = {
            id: decoded.adminId || decoded.teamId,
            isAdmin: true,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin token.',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Admin token expired. Please login again.',
            });
        }

        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during admin authentication',
        });
    }
};

module.exports = adminMiddleware;
