require('dotenv').config();
const mongoose = require('mongoose');
const EventSettings = require('../src/models/EventSettings');
const Team = require('../src/models/Team');
const Hint = require('../src/models/Hint');
const QRStage = require('../src/models/QRStage');

/**
 * Debug Script for Event Status and Scanning Issues
 */

const debugEventStatus = async () => {
    try {
        console.log('🔍 Debugging Event and Scanning Issues...\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check Event Settings
        console.log('=' + '='.repeat(59));
        console.log('📋 EVENT SETTINGS');
        console.log('=' + '='.repeat(59));

        const settings = await EventSettings.findOne();
        if (settings) {
            console.log('  Event ID:', settings._id);
            console.log('  Event Name:', settings.eventName);
            console.log('  Event Status:', settings.eventStatus);
            console.log('  Started At:', settings.startedAt || 'Not started');
            console.log('  Started By:', settings.startedBy || 'N/A');
            console.log('  Ended At:', settings.endedAt || 'Not ended');
            console.log('  Ended By:', settings.endedBy || 'N/A');
            console.log('');

            if (settings.eventStatus !== 'active') {
                console.log('⚠️  WARNING: Event is NOT active!');
                console.log('   Current status:', settings.eventStatus);
                console.log('   Teams cannot scan QR codes until event is active.\n');
            } else {
                console.log('✅ Event is ACTIVE - Teams can scan\n');
            }
        } else {
            console.log('❌ No event settings found!');
            console.log('   Creating default settings...');
            await EventSettings.create({
                _id: 'event_settings',
                eventName: 'Freshers Treasure Hunt',
                eventStatus: 'not_started'
            });
            console.log('✅ Default settings created\n');
        }

        // 2. Check Hints
        console.log('=' + '='.repeat(59));
        console.log('🎯 HINTS STATUS');
        console.log('=' + '='.repeat(59));

        const totalHints = await Hint.countDocuments();
        const activeHints = await Hint.countDocuments({ active: true });

        console.log('  Total Hints:', totalHints);
        console.log('  Active Hints:', activeHints);

        if (totalHints === 0) {
            console.log('  ❌ NO HINTS FOUND!');
            console.log('     Run: npm run seed:hints\n');
        } else {
            const sampleHint = await Hint.findOne();
            console.log('  Sample Hint:');
            console.log('    ID:', sampleHint.hintId);
            console.log('    QR ID:', sampleHint.qrId);
            console.log('    Text:', sampleHint.text.substring(0, 50) + '...');
            console.log('    Used by teams:', sampleHint.usedByTeams.length);
            console.log('');
        }

        // 3. Check QR Codes
        console.log('=' + '='.repeat(59));
        console.log('📱 QR CODES STATUS');
        console.log('=' + '='.repeat(59));

        const totalQRs = await QRStage.countDocuments();
        const activeQRs = await QRStage.countDocuments({ active: true });
        const startQR = await QRStage.findOne({ isStartQR: true });

        console.log('  Total QR Codes:', totalQRs);
        console.log('  Active QR Codes:', activeQRs);
        console.log('  START QR:', startQR ? '✅ EXISTS' : '❌ NOT FOUND');

        if (startQR) {
            console.log('    Code:', startQR.code);
            console.log('    Location:', startQR.locationName);
        }
        console.log('');

        // 4. Check Sample Team
        console.log('=' + '='.repeat(59));
        console.log('👥 SAMPLE TEAM STATUS');
        console.log('=' + '='.repeat(59));

        const team = await Team.findOne().sort({ createdAt: -1 });
        if (team) {
            console.log('  Team Name:', team.teamName);
            console.log('  Points:', team.points);
            console.log('  Is Active:', team.isActive);
            console.log('  Current Hint ID:', team.currentHintId || 'None (not started)');
            console.log('  Scanned QRs:', team.scannedQRs?.length || 0);
            console.log('  Hints Completed:', team.hintLog?.filter(h => h.status === 'completed').length || 0);
            console.log('  Wrong Scans:', team.wrongScans || 0);
            console.log('');

            if (!team.isActive) {
                console.log('  ⚠️  Team is INACTIVE (eliminated)');
                console.log('     Team needs to scan a rejoin QR\n');
            }

            if (!team.currentHintId && team.scannedQRs?.length === 0) {
                console.log('  ℹ️  Team has not started the game');
                console.log('     Team should scan START QR first\n');
            }
        } else {
            console.log('  ❌ No teams found in database\n');
        }

        // 5. Diagnosis
        console.log('=' + '='.repeat(59));
        console.log('🔧 DIAGNOSIS');
        console.log('=' + '='.repeat(59));

        const issues = [];

        if (!settings || settings.eventStatus !== 'active') {
            issues.push('Event is not active - Admin must start the event');
        }

        if (totalHints === 0) {
            issues.push('No hints in database - Run npm run seed:hints');
        }

        if (!startQR) {
            issues.push('START QR missing - Run npm run seed:hints');
        }

        if (issues.length === 0) {
            console.log('✅ No issues found! System should be working.\n');
            console.log('If teams still can\'t scan:');
            console.log('  1. Check team is using correct QR codes');
            console.log('  2. Check team has valid auth token');
            console.log('  3. Check backend server is running');
            console.log('  4. Check API endpoint: POST /api/game/start');
            console.log('  5. Check API endpoint: POST /api/game/scan\n');
        } else {
            console.log('❌ Issues found:\n');
            issues.forEach((issue, idx) => {
                console.log(`  ${idx + 1}. ${issue}`);
            });
            console.log('');
        }

        // 6. Quick Fix Option
        if (settings && settings.eventStatus !== 'active') {
            console.log('=' + '='.repeat(59));
            console.log('🚀 QUICK FIX');
            console.log('=' + '='.repeat(59));
            console.log('Would you like to start the event now? (Manual action required)');
            console.log('Run this command:');
            console.log('  npm run start:event\n');
            console.log('Or via API:');
            console.log('  POST /api/admin/event/start\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

debugEventStatus();
