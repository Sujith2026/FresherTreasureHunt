const mongoose = require('mongoose');
const Team = require('../src/models/Team');
const Hint = require('../src/models/Hint');
require('dotenv').config();

const fixTeamHints = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all teams
        const teams = await Team.find({});
        console.log(`Found ${teams.length} teams\n`);

        // Get all valid hint IDs
        const validHints = await Hint.find({ active: true });
        const validHintIds = validHints.map(h => h.hintId);
        console.log(`Valid hint IDs: ${validHintIds.join(', ')}\n`);

        for (const team of teams) {
            console.log(`\n📋 Team: ${team.teamName}`);
            console.log(`   Current Hint ID: ${team.currentHintId || 'None'}`);

            let fixed = false;

            // Check if current hint ID is invalid
            if (team.currentHintId && !validHintIds.includes(team.currentHintId)) {
                console.log(`   ❌ Invalid hint ID: ${team.currentHintId}`);

                // Reset the team's game state
                team.currentHintId = null;
                team.hintLog = [];
                team.scannedQRs = team.scannedQRs.filter(qr => qr === 'START');
                team.wrongScans = 0;

                fixed = true;
                console.log(`   ✅ Reset team game state`);
            }

            // Check hint log for invalid hints
            const invalidLogEntries = team.hintLog.filter(log => !validHintIds.includes(log.hintId));
            if (invalidLogEntries.length > 0) {
                console.log(`   ❌ Found ${invalidLogEntries.length} invalid hint log entries`);
                team.hintLog = team.hintLog.filter(log => validHintIds.includes(log.hintId));
                fixed = true;
                console.log(`   ✅ Cleaned hint log`);
            }

            if (fixed) {
                await team.save();
                console.log(`   💾 Saved changes`);
            } else {
                console.log(`   ✅ Team data is valid`);
            }
        }

        console.log('\n\n✅ All teams fixed!');
        console.log('\nTeams can now:');
        console.log('  1. Scan START QR again to begin fresh');
        console.log('  2. Get a valid hint from the current pool');
        console.log('  3. Scan matching QR codes\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixTeamHints();
