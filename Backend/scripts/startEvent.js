require('dotenv').config();
const mongoose = require('mongoose');
const EventSettings = require('../src/models/EventSettings');

/**
 * Start Event Script
 * Quickly starts the event without needing API call
 */

const startEvent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const settings = await EventSettings.getSettings();

        if (settings.eventStatus === 'active') {
            console.log('ℹ️  Event is already ACTIVE');
            console.log('   Started at:', settings.startedAt);
            console.log('   Started by:', settings.startedBy);
            console.log('\n✅ Teams can scan QR codes now!\n');
            process.exit(0);
            return;
        }

        // Start the event
        await EventSettings.updateStatus('active', 'admin-script');

        console.log('🎉 EVENT STARTED!');
        console.log('');
        console.log('📊 Event Details:');
        console.log('   Name:', settings.eventName);
        console.log('   Status: ACTIVE');
        console.log('   Started at:', new Date().toISOString());
        console.log('   Started by: admin-script');
        console.log('');
        console.log('✅ Teams can now:');
        console.log('   1. Scan START QR to begin');
        console.log('   2. Receive their first hint');
        console.log('   3. Find and scan location QR codes');
        console.log('   4. Earn points for correct scans');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error starting event:', error);
        process.exit(1);
    }
};

startEvent();
