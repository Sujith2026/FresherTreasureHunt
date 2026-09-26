require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../src/models/Team');
const ScanLog = require('../src/models/ScanLog');
const EventSettings = require('../src/models/EventSettings');
const Hint = require('../src/models/Hint');

/**
 * Reset Event Script
 * 
 * This script resets the event for testing purposes:
 * - Clears all team progress (hints, scans, points)
 * - Clears scan logs
 * - Resets hint usage tracking
 * - Keeps teams registered (doesn't delete teams)
 * - Keeps QR codes and hints intact
 * - Event remains active (teams can scan START QR anytime)
 */

const resetEvent = async () => {
    try {
        console.log('🔄 Starting Event Reset...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Keep Event Active (no status change needed)
        console.log('📝 Keeping event active (teams can start anytime)...');
        const settings = await EventSettings.findOne();
        if (!settings) {
            console.log('⚠️ No event settings found. Creating default...');
            await EventSettings.create({
                eventName: 'Freshers Treasure Hunt',
                eventStatus: 'active',
                eventDescription: 'QR Code Treasure Hunt'
            });
            console.log('✅ Default event settings created (active)\n');
        } else {
            console.log(`✅ Event status: ${settings.eventStatus} (unchanged)\n`);
        }

        // 2. Reset All Teams' Game Progress
        console.log('👥 Resetting all teams\' game progress...');
        const teamUpdateResult = await Team.updateMany(
            {},
            {
                $set: {
                    points: 0,
                    currentHintId: null,
                    hintLog: [],
                    scannedQRs: [],
                    wrongScans: 0,
                    lastScanAt: null,
                    isActive: true
                }
            }
        );
        console.log(`✅ Reset ${teamUpdateResult.modifiedCount} teams\n`);

        // 3. Clear All Scan Logs
        console.log('📋 Clearing scan logs...');
        const scanDeleteResult = await ScanLog.deleteMany({});
        console.log(`✅ Deleted ${scanDeleteResult.deletedCount} scan logs\n`);

        // 4. Reset Hint Usage (clear usedByTeams)
        console.log('🎯 Resetting hint usage tracking...');
        const hintUpdateResult = await Hint.updateMany(
            {},
            {
                $set: {
                    usedByTeams: []
                }
            }
        );
        console.log(`✅ Reset ${hintUpdateResult.modifiedCount} hints\n`);

        // 5. Get Summary
        const totalTeams = await Team.countDocuments();
        const totalHints = await Hint.countDocuments();
        const eventStatus = await EventSettings.findOne();

        // Print Summary
        console.log('='.repeat(60));
        console.log('✅ EVENT RESET COMPLETE');
        console.log('='.repeat(60));
        console.log(`📊 Teams: ${totalTeams} (all reset to 0 points)`);
        console.log(`📊 Hints: ${totalHints} (all available for use)`);
        console.log(`📊 Scan Logs: 0 (all cleared)`);
        console.log(`⚙️ Event Status: ${eventStatus.eventStatus}`);
        console.log('');
        console.log('🎮 Ready for New Game:');
        console.log('   1. Teams can login with existing credentials');
        console.log('   2. Teams scan START QR to begin anytime');
        console.log('   3. All hints are available again');
        console.log('   4. Admin can end event when needed');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting event:', error);
        process.exit(1);
    }
};

// Run the reset
resetEvent();
