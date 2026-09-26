const validateScan = (req, res, next) => {
    const { qrCode } = req.body;

    if (!qrCode) {
        return res.status(400).json({
            success: false,
            message: 'QR code is required',
        });
    }

    if (typeof qrCode !== 'string' || qrCode.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'QR code must be a non-empty string',
        });
    }

    // Normalize QR code to uppercase
    req.body.qrCode = qrCode.trim().toUpperCase();

    next();
};

const validateTeamRegistration = (req, res, next) => {
    const { teamName, password, leaderName, leaderEmail } = req.body;

    const errors = [];

    if (!teamName || teamName.trim().length < 3) {
        errors.push('Team name must be at least 3 characters long');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!leaderName || leaderName.trim().length < 2) {
        errors.push('Leader name must be at least 2 characters long');
    }

    if (!leaderEmail || !/^\S+@\S+\.\S+$/.test(leaderEmail)) {
        errors.push('Valid leader email is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};

const validateMemberData = (req, res, next) => {
    const { name, email, role } = req.body;

    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Member name must be at least 2 characters long');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (role && !['leader', 'member'].includes(role)) {
        errors.push('Role must be either "leader" or "member"');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};

module.exports = {
    validateScan,
    validateTeamRegistration,
    validateMemberData,
};
