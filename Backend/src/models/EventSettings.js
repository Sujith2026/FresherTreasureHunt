const mongoose = require('mongoose');

const eventSettingsSchema = new mongoose.Schema(
    {
        // Singleton pattern - only one document exists
        _id: {
            type: String,
            default: 'event_settings',
        },

        // Event status
        eventStatus: {
            type: String,
            enum: ['not_started', 'active', 'ended'],
            default: 'not_started',
        },

        // Event metadata
        eventName: {
            type: String,
            default: 'Treasure Hunt Event',
        },

        eventDescription: {
            type: String,
            default: '',
        },

        // Timestamps for event lifecycle
        startedAt: {
            type: Date,
            default: null,
        },

        endedAt: {
            type: Date,
            default: null,
        },

        // Admin who started/ended the event
        startedBy: {
            type: String,
            default: null,
        },

        endedBy: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Static method to get current event settings (singleton)
eventSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findById('event_settings');

    // Create default settings if none exist
    if (!settings) {
        settings = await this.create({ _id: 'event_settings' });
    }

    return settings;
};

// Static method to update event status
eventSettingsSchema.statics.updateStatus = async function (status, adminName = null) {
    const settings = await this.getSettings();

    settings.eventStatus = status;

    if (status === 'active') {
        settings.startedAt = new Date();
        settings.startedBy = adminName;
        settings.endedAt = null;
        settings.endedBy = null;
    } else if (status === 'ended') {
        settings.endedAt = new Date();
        settings.endedBy = adminName;
    } else if (status === 'not_started') {
        settings.startedAt = null;
        settings.startedBy = null;
        settings.endedAt = null;
        settings.endedBy = null;
    }

    await settings.save();
    return settings;
};

// Static method to check if event is active
eventSettingsSchema.statics.isEventActive = async function () {
    const settings = await this.getSettings();
    return settings.eventStatus === 'active';
};

const EventSettings = mongoose.model('EventSettings', eventSettingsSchema);
module.exports = EventSettings;
