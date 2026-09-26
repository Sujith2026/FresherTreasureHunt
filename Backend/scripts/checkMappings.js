const mongoose = require('mongoose');
const Hint = require('../src/models/Hint');
const QRStage = require('../src/models/QRStage');
require('dotenv').config();

const checkMappings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/treasure-hunt');
        console.log('Connected to MongoDB\n');

        console.log('=== HINTS ===');
        const hints = await Hint.find({}).sort({ hintId: 1 });
        console.log(`Total hints: ${hints.length}\n`);

        hints.forEach(h => {
            console.log(`${h.hintId} -> points to QR: ${h.qrId} (${h.points} points)`);
            console.log(`  Text: ${h.text.substring(0, 80)}...`);
            console.log(`  Type: ${h.hintType}, Active: ${h.active}`);
            console.log('');
        });

        console.log('\n=== QR CODES ===');
        const qrs = await QRStage.find({}).sort({ code: 1 });
        console.log(`Total QR codes: ${qrs.length}\n`);

        qrs.forEach(q => {
            console.log(`${q.code} - Location: ${q.location || 'N/A'}`);
            console.log(`  isStart: ${q.isStartQR}, active: ${q.active}`);
            console.log('');
        });

        console.log('\n=== VALIDATION: Hint -> QR Mapping ===');
        let errors = 0;
        for (const hint of hints) {
            const qrExists = await QRStage.findOne({ code: hint.qrId });
            if (!qrExists) {
                console.log(`❌ ERROR: Hint ${hint.hintId} points to non-existent QR: ${hint.qrId}`);
                errors++;
            } else if (!qrExists.active) {
                console.log(`⚠️  WARNING: Hint ${hint.hintId} points to inactive QR: ${hint.qrId}`);
            } else {
                console.log(`✓ Hint ${hint.hintId} -> QR ${hint.qrId} (valid)`);
            }
        }

        console.log('\n=== VALIDATION: QR Coverage ===');
        const qrCodesWithoutHints = [];
        for (const qr of qrs) {
            if (qr.isStartQR) {
                console.log(`✓ ${qr.code} is START QR (doesn't need hint)`);
                continue;
            }
            const hintExists = await Hint.findOne({ qrId: qr.code });
            if (!hintExists) {
                console.log(`⚠️  WARNING: QR ${qr.code} has no hint pointing to it`);
                qrCodesWithoutHints.push(qr.code);
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log(`Total Hints: ${hints.length}`);
        console.log(`Total QR Codes: ${qrs.length}`);
        console.log(`Mapping Errors: ${errors}`);
        console.log(`QR Codes without hints: ${qrCodesWithoutHints.length}`);

        if (errors > 0) {
            console.log('\n❌ CRITICAL: Fix the hint-to-QR mappings above!');
        } else {
            console.log('\n✅ All hint-to-QR mappings are valid!');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkMappings();
