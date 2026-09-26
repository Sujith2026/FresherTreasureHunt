const mongoose = require('mongoose');

const qrStageSchema = new mongoose.Schema(
  {
    // Each QR code has a unique string identifier
    code: {
      type: String,
      required: [true, 'QR code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ✨ NEW: Mark if this is a start QR
    isStartQR: {
      type: Boolean,
      default: false,
    },

    // ✨ NEW: Which hint leads to this QR (for new game flow)
    linkedHintId: {
      type: String,
      uppercase: true,
      trim: true,
    },

    // ✨ NEW: Location name for better UX
    locationName: {
      type: String,
      trim: true,
    },

    // ✨ NEW: QR Code image (base64 data URL)
    qrCodeImage: {
      type: String, // Stores base64 encoded image data URL
    },

    // 🎯 UPDATED: Array of hint objects (keeping for backward compatibility)
    hints: {
      type: [
        {
          index: {
            type: Number,
            required: true,
          },
          hint: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: false, // Made optional for new flow
      default: [], // Default to empty array
      validate: {
        // Validator allows empty array for new flow (using linkedHintId instead)
        validator: function (arr) {
          // If using new flow with linkedHintId, hints can be empty
          if (this.linkedHintId || this.isStartQR) return true;
          // For old flow, hints array must not be empty
          return arr && arr.length > 0;
        },
        message: 'Hint array cannot be empty unless linkedHintId is provided',
      },
    },

    // Optional: type of hint (text/image/video)
    hintType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text',
    },

    // Points to award for scanning this QR
    points: {
      type: Number,
      default: 100,
      min: [0, 'Points cannot be negative'],
    },

    // Whether this QR is active (can be scanned)
    active: {
      type: Boolean,
      default: true,
    },

    // Optional descriptive info
    description: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    // How many times this QR has been scanned
    scanCount: {
      type: Number,
      default: 0,
    },

    // 🔑 FIX: Added stageIndex to satisfy the unique index
    stageIndex: {
      type: Number,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Find a QR by code
qrStageSchema.statics.findByCode = async function (code) {
  return this.findOne({ code: code.toUpperCase(), active: true });
};

// Get all active QRs
qrStageSchema.statics.getActiveQRCodes = async function () {
  return this.find({ active: true }).lean();
};

// Increment scan count safely
qrStageSchema.methods.incrementScanCount = function () {
  this.scanCount += 1;
  return this.save();
};

const QRStage = mongoose.model('QRStage', qrStageSchema);

module.exports = QRStage;