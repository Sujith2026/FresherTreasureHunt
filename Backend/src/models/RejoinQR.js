const mongoose = require('mongoose');

const rejoinQRSchema = new mongoose.Schema(
    {
        // Unique code for the rejoin QR
        code: {
            type: String,
            required: [true, 'Rejoin QR code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Display name for admin reference
        name: {
            type: String,
            required: [true, 'Rejoin QR name is required'],
            trim: true,
        },

        // Description/purpose of this rejoin QR
        description: {
            type: String,
            default: '',
        },

        // Maximum number of teams that can use this QR
        maxUsageCount: {
            type: Number,
            required: [true, 'Maximum usage count is required'],
            min: [1, 'Usage count must be at least 1'],
            default: 1,
        },

        // Current usage count
        currentUsageCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Teams that have used this rejoin QR
        usedByTeams: [
            {
                teamId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Team',
                },
                teamName: String,
                usedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Is this rejoin QR active?
        active: {
            type: Boolean,
            default: true,
        },

        // Optional expiry date
        expiresAt: {
            type: Date,
            default: null,
        },

        // Points to award/deduct when team rejoins (optional)
        pointsAdjustment: {
            type: Number,
            default: 0,
        },

        // Admin who created this rejoin QR
        createdBy: {
            type: String,
            default: 'admin',
        },

        // QR code image (base64 data URL)
        qrCodeImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Check if rejoin QR is valid and available
rejoinQRSchema.methods.isValid = function () {
    // Check if active
    if (!this.active) {
        return { valid: false, reason: 'This rejoin QR has been deactivated.' };
    }

    // Check if expired
    if (this.expiresAt && new Date() > this.expiresAt) {
        return { valid: false, reason: 'This rejoin QR has expired.' };
    }

    // Check if usage limit reached
    if (this.currentUsageCount >= this.maxUsageCount) {
        return { valid: false, reason: 'This rejoin QR has no remaining uses.' };
    }

    return { valid: true };
};

// Use the rejoin QR for a team
rejoinQRSchema.methods.useForTeam = async function (teamId, teamName) {
    const validity = this.isValid();

    if (!validity.valid) {
        throw new Error(validity.reason);
    }

    // Check if team already used this QR
    const alreadyUsed = this.usedByTeams.some(
        (usage) => usage.teamId.toString() === teamId.toString()
    );

    if (alreadyUsed) {
        throw new Error('Your team has already used this rejoin QR.');
    }

    // Record usage
    this.usedByTeams.push({
        teamId,
        teamName,
        usedAt: new Date(),
    });

    this.currentUsageCount += 1;
    await this.save();

    return {
        success: true,
        remainingUses: this.maxUsageCount - this.currentUsageCount,
    };
};

// Get available rejoin QRs
rejoinQRSchema.statics.getAvailableQRs = async function () {
    const now = new Date();

    return this.find({
        active: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: now } },
        ],
        $expr: { $lt: ['$currentUsageCount', '$maxUsageCount'] },
    }).sort({ createdAt: -1 });
};

const RejoinQR = mongoose.model('RejoinQR', rejoinQRSchema);
module.exports = RejoinQR;
