const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['leader', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [50, 'Team name cannot exceed 50 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    members: {
      type: [memberSchema],
      default: [],
      validate: {
        validator: function (members) {
          return members.length <= 10;
        },
        message: 'A team cannot have more than 10 members',
      },
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastScanAt: Date,

    // Legacy stage-based tracking retained for reference only
    // scannedHints: {
    //   type: [String],
    //   default: [],
    // },

    // hintsGiven: {
    //   type: [String],
    //   default: [],
    // },

    // scanHistory: [
    //   {
    //     qrId: String,
    //     hintGiven: String,
    //     scannedAt: { type: Date, default: Date.now },
    //   },
    // ],

    // ✨ NEW GAME FLOW FIELDS
    // Current active hint the team should follow
    currentHintId: {
      type: String,
      default: null,
    },

    // Complete history of all hints received by this team
    hintLog: [
      {
        hintId: {
          type: String,
          required: true,
        },
        hintText: {
          type: String,
          required: true,
        },
        hintType: {
          type: String,
          enum: ['text', 'image', 'video'],
          default: 'text',
        },
        status: {
          type: String,
          enum: ['active', 'completed', 'wrong'],
          default: 'active',
        },
        qrScanned: {
          type: String, // The QR code that was scanned (if any)
          default: null,
        },
        pointsEarned: {
          type: Number,
          default: 0,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Track QR codes scanned (for new flow)
    scannedQRs: {
      type: [String],
      default: [],
    },

    // Count wrong scans for analytics
    wrongScans: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard
teamSchema.index({ points: -1, teamName: 1 });

// Password hash
teamSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
teamSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch {
    return false;
  }
};

// Add points
teamSchema.methods.addPoints = function (points) {
  this.points = Math.max(0, this.points + points);
  return this.points;
};

// Get leaderboard
teamSchema.statics.getLeaderboard = async function () {
  return this.find({ isActive: true })
    .select('teamName points members lastScanAt hintLog wrongScans')
    .sort({ points: -1, lastScanAt: 1 })
    .lean();
};

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
