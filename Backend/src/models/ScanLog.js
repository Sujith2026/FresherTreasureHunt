const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team ID is required'],
            index: true,
        },
        teamName: {
            type: String,
            required: true,
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Optional, in case team scans without specific member
        },
        memberName: {
            type: String,
            required: false,
        },
        qrCode: {
            type: String,
            required: [true, 'QR code is required'],
            uppercase: true,
        },
        stageIndex: {
            type: Number,
            default: null,
        },
        teamStageAtScan: {
            type: Number,
            default: null,
        },
        result: {
            type: String,
            enum: ['accepted', 'rejected', 'duplicate', 'error'],
            required: [true, 'Scan result is required'],
        },
        pointsDelta: {
            type: Number,
            default: 0,
        },
        totalPointsAfter: {
            type: Number,
            required: true,
        },
        message: {
            type: String,
            trim: true,
        },

        // ✨ NEW GAME FLOW FIELDS
        // Was the scanned QR the correct one based on current hint?
        isCorrectQR: {
            type: Boolean,
            default: null,
        },

        // What QR was expected (based on current hint)?
        expectedQrId: {
            type: String,
            uppercase: true,
        },

        // What QR was actually scanned?
        actualQrId: {
            type: String,
            uppercase: true,
        },

        // Hint that was given after this scan (if successful)
        hintGiven: {
            hintId: String,
            hintText: String,
        },

        ipAddress: {
            type: String,
        },
        scannedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: false,
    }
);

// Compound index to prevent duplicate scans
scanLogSchema.index({ teamId: 1, qrCode: 1, result: 1 });
scanLogSchema.index({ teamId: 1, scannedAt: -1 });
scanLogSchema.index({ result: 1, scannedAt: -1 });

// Static method to check if already scanned
scanLogSchema.statics.hasTeamScannedQR = async function (teamId, qrCode) {
    const scan = await this.findOne({
        teamId,
        qrCode: qrCode.toUpperCase(),
        result: 'accepted',
    });
    return !!scan;
};

// Static method to get team's scan history
scanLogSchema.statics.getTeamHistory = async function (teamId, limit = 50) {
    return this.find({ teamId })
        .sort({ scannedAt: -1 })
        .limit(limit)
        .select('-__v')
        .lean();
};

// Static method to get analytics
scanLogSchema.statics.getAnalytics = async function () {
    return this.aggregate([
        {
            $group: {
                _id: '$result',
                count: { $sum: 1 },
            },
        },
    ]);
};

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

module.exports = ScanLog;
