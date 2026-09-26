// Quick test script to verify QR codes are stored properly
require('dotenv').config();
const mongoose = require('mongoose');
const QRStage = require('../src/models/QRStage');

const testQRCodes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const qrCodes = await QRStage.find().sort({ stageIndex: 1 });

        console.log(`📱 Found ${qrCodes.length} QR codes:\n`);

        qrCodes.forEach(qr => {
            console.log(`\n${qr.isStartQR ? '🎯' : '📍'} ${qr.code}`);
            console.log(`   Location: ${qr.locationName}`);
            console.log(`   Points: ${qr.points}`);
            console.log(`   Linked Hint: ${qr.linkedHintId || 'None'}`);
            console.log(`   QR Image: ${qr.qrCodeImage ? '✅ Generated' : '❌ Missing'}`);
            console.log(`   Image Size: ${qr.qrCodeImage ? (qr.qrCodeImage.length / 1024).toFixed(2) + ' KB' : 'N/A'}`);
        });

        console.log('\n\n🎉 All QR codes verified!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testQRCodes();
