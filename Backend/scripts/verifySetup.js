require('dotenv').config();
const mongoose = require('mongoose');
const Hint = require('../src/models/Hint');
const QRStage = require('../src/models/QRStage');
const EventSettings = require('../src/models/EventSettings');

const verifySetup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check Hints
        const hints = await Hint.find().limit(3);
        console.log('📝 Sample Hints (first 3):');
        hints.forEach(h => {
            console.log(`   ${h.hintId} -> ${h.qrId} (${h.points} pts)`);
        });
        const totalHints = await Hint.countDocuments();
        console.log(`   Total Hints: ${totalHints}\n`);

        // Check QR Codes
        const qrs = await QRStage.find().limit(3);
        console.log('📱 Sample QR Codes (first 3):');
        qrs.forEach(qr => {
            console.log(`   ${qr.code} -> Linked to: ${qr.linkedHintId || 'None'} (Start: ${qr.isStartQR})`);
        });
        const totalQRs = await QRStage.countDocuments();
        console.log(`   Total QR Codes: ${totalQRs}\n`);

        // Check START QR
        const startQR = await QRStage.findOne({ code: 'START' });
        console.log('🎯 START QR:', startQR ? '✅ EXISTS' : '❌ NOT FOUND\n');

        // Check Event Settings
        let settings = await EventSettings.findOne();
        console.log('⚙️ Event Settings:');
        if (!settings) {
            console.log('   ⚠️ No settings found. Creating default...');
            settings = await EventSettings.create({
                eventName: 'Freshers Treasure Hunt',
                eventStatus: 'not_started',
                eventDescription: 'QR Code Treasure Hunt',
            });
            console.log('   ✅ Created default settings');
        }
        console.log(`   Event Name: ${settings.eventName}`);
        console.log(`   Event Status: ${settings.eventStatus}`);
        console.log(`   ${settings.eventStatus === 'not_started' ? '⚠️ Event NOT started - Admin needs to start it!' : '✅ Event is ' + settings.eventStatus}\n`);

        // Summary
        console.log('=' + '='.repeat(50));
        console.log('✅ SETUP VERIFICATION COMPLETE');
        console.log('=' + '='.repeat(50));
        console.log(`📊 Total Hints: ${totalHints}`);
        console.log(`📊 Total QR Codes: ${totalQRs}`);
        console.log(`🎯 START QR: ${startQR ? 'Ready' : 'Missing'}`);
        console.log(`⚙️ Event Status: ${settings.eventStatus}`);
        console.log('');

        if (settings.eventStatus === 'not_started') {
            console.log('⚠️ ACTION REQUIRED:');
            console.log('   Admin must start the event via:');
            console.log('   POST /api/admin/event/start');
            console.log('   Or use the Admin Dashboard to start the event.\n');
        } else {
            console.log('✅ System ready for teams to scan!\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifySetup();
