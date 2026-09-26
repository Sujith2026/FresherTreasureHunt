const mongoose = require('mongoose');

const hintSchema = new mongoose.Schema(
    {
        // Unique hint identifier
        hintId: {
            type: String,
            required: [true, 'Hint ID is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },

        // The actual clue/riddle text
        text: {
            type: String,
            required: [true, 'Hint text is required'],
            trim: true,
        },

        // Which QR code this hint leads to
        qrId: {
            type: String,
            required: [true, 'Target QR ID is required'],
            uppercase: true,
        },

        // Points awarded when correct QR is scanned
        points: {
            type: Number,
            default: 10,
            min: [0, 'Points cannot be negative'],
        },

        // Track which teams have already used this hint
        usedByTeams: {
            type: [String], // Array of team IDs
            default: [],
        },

        // Optional: hint type (text, image, video)
        hintType: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
        },

        // Optional: difficulty level
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },

        // Whether this hint is active
        active: {
            type: Boolean,
            default: true,
        },

        // Optional: additional metadata
        metadata: {
            type: Map,
            of: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
hintSchema.index({ qrId: 1 });
hintSchema.index({ active: 1 });

// Static method: Get unused hints for a team
hintSchema.statics.getUnusedHints = async function (teamId) {
    return this.find({
        active: true,
        usedByTeams: { $ne: teamId },
    }).lean();
};

// Static method: Get random unused hint for a team
hintSchema.statics.getRandomUnusedHint = async function (teamId) {
    const unusedHints = await this.find({
        active: true,
        usedByTeams: { $ne: teamId },
    }).lean();

    if (unusedHints.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * unusedHints.length);
    return unusedHints[randomIndex];
};

// Method: Mark hint as used by a team
hintSchema.methods.markUsedByTeam = async function (teamId) {
    if (!this.usedByTeams.includes(teamId)) {
        this.usedByTeams.push(teamId);
        await this.save();
    }
    return this;
};

const Hint = mongoose.model('Hint', hintSchema);

module.exports = Hint;
