require('dotenv').config();
const mongoose = require('mongoose');
const EventSettings = require('../src/models/EventSettings');

/**
 * Initialize Event Script
 * 
 * Sets the event to active status so teams can start scanning anytime.
 * Only needs to be run once during initial setup.
 */

const initEvent = async () => {
    try {
        console.log('🔄 Initializing Event...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get or create event settings
        let settings = await EventSettings.findOne();

        if (!settings) {
            console.log('📝 Creating event settings...');
            settings = await EventSettings.create({
                eventName: 'Freshers Treasure Hunt',
                eventStatus: 'active',
                eventDescription: 'QR Code Treasure Hunt'
            });
            console.log('✅ Event settings created\n');
        } else if (settings.eventStatus !== 'active') {
            console.log('📝 Setting event to active...');
            settings.eventStatus = 'active';
            await settings.save();
            console.log('✅ Event status updated to active\n');
        } else {
            console.log('✅ Event is already active\n');
        }

        console.log('='.repeat(60));
        console.log('✅ EVENT INITIALIZED');
        console.log('='.repeat(60));
        console.log(`⚙️ Event Name: ${settings.eventName}`);
        console.log(`⚙️ Event Status: ${settings.eventStatus}`);
        console.log('');
        console.log('🎮 Teams can now:');
        console.log('   1. Login with their credentials');
        console.log('   2. Scan START QR to begin anytime');
        console.log('   3. Play the treasure hunt');
        console.log('');
        console.log('👨‍💼 Admin can:');
        console.log('   - Monitor progress via dashboard');
        console.log('   - End event when needed: POST /api/admin/event/end');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing event:', error);
        process.exit(1);
    }
};

// Run the initialization
initEvent();
