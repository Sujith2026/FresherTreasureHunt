const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

/**
 * Generate JWT token
 */
const generateToken = (teamId, isAdmin = false) => {
    return jwt.sign(
        { teamId, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * @desc    Register a new team
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerTeam = async (req, res, next) => {
    try {
        const { teamName, password, leaderName, leaderEmail } = req.body;

        // Check if team already exists
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: 'Team name already exists. Please choose a different name.',
            });
        }

        // Create new team with leader as first member
        const team = new Team({
            teamName,
            passwordHash: password, // Will be hashed by pre-save hook
            members: [
                {
                    name: leaderName,
                    email: leaderEmail ? leaderEmail.toLowerCase() : undefined,
                    role: 'leader',
                },
            ],
        });

        await team.save();

        // Generate token (not admin)
        const token = generateToken(team._id, false);

        res.status(201).json({
            success: true,
            message: 'Team registered successfully',
            data: {
                token,
                team: {
                    id: team._id,
                    teamName: team.teamName,
                    points: team.points,
                    currentStage: team.currentStage,
                    members: team.members,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login team
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginTeam = async (req, res, next) => {
    try {
        const { teamName, password } = req.body;

        // Validate input
        if (!teamName || !password) {
            return res.status(400).json({
                success: false,
                message: 'Team name and password are required',
            });
        }

        // Find team by name (include password for comparison)
        const team = await Team.findOne({ teamName }).select('+passwordHash');

        if (!team) {
            return res.status(401).json({
                success: false,
                message: 'Invalid team name or password',
            });
        }

        // Check if team is active
        if (!team.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Team is inactive. Contact administrator.',
            });
        }

        // Compare password
        const isPasswordValid = await team.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid team name or password',
            });
        }

        // Generate token
        const token = generateToken(team._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                team: {
                    id: team._id,
                    teamName: team.teamName,
                    points: team.points,
                    currentStage: team.currentStage,
                    members: team.members,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current team info
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const team = req.team;

        res.json({
            success: true,
            data: {
                team: {
                    id: team._id,
                    teamName: team.teamName,
                    points: team.points,
                    currentStage: team.currentStage,
                    members: team.members,
                    completedStages: team.completedStages,
                    lastScanAt: team.lastScanAt,
                    createdAt: team.createdAt,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Admin login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Simple admin credentials (in production, use database with hashed passwords)
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials',
            });
        }

        // Generate admin token
        const token = generateToken('admin-id', true);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: { token },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerTeam,
    loginTeam,
    getMe,
    adminLogin,
};
