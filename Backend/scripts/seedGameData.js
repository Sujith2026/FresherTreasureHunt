require('dotenv').config();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Hint = require('../src/models/Hint');
const QRStage = require('../src/models/QRStage');

// Sample hints and QR codes for the treasure hunt
const sampleHints = [
    {
        hintId: 'HINT_001',
        text: 'Find where books meet technology - the entrance awaits.',
        qrId: 'QR_LIBRARY',
        points: 15,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_002',
        text: 'Ascend to the third floor where science comes alive.',
        qrId: 'QR_LAB',
        points: 20,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_003',
        text: 'Where students gather to refuel - near the flowing water.',
        qrId: 'QR_CAFE',
        points: 15,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_004',
        text: 'The heart of performances - where voices echo and art thrives.',
        qrId: 'QR_AUDITORIUM',
        points: 25,
        hintType: 'text',
        difficulty: 'hard',
    },
    {
        hintId: 'HINT_005',
        text: 'Green spaces call - where nature meets learning.',
        qrId: 'QR_GARDEN',
        points: 20,
        hintType: 'text',
        difficulty: 'medium',
    },
];

const sampleQRs = [
    {
        code: 'START',
        isStartQR: true,
        locationName: 'Start Point - Main Entrance',
        hints: [], // Start QR has no hints
        points: 0,
        active: true,
        stageIndex: 0,
    },
    {
        code: 'QR_LIBRARY',
        isStartQR: false,
        linkedHintId: 'HINT_001',
        locationName: 'Library Entrance',
        hints: [], // Using new hint system
        points: 100,
        active: true,
        stageIndex: 1,
    },
    {
        code: 'QR_LAB',
        isStartQR: false,
        linkedHintId: 'HINT_002',
        locationName: 'Science Lab - 3rd Floor',
        hints: [],
        points: 100,
        active: true,
        stageIndex: 2,
    },
    {
        code: 'QR_CAFE',
        isStartQR: false,
        linkedHintId: 'HINT_003',
        locationName: 'Cafeteria',
        hints: [],
        points: 100,
        active: true,
        stageIndex: 3,
    },
    {
        code: 'QR_AUDITORIUM',
        isStartQR: false,
        linkedHintId: 'HINT_004',
        locationName: 'Main Auditorium',
        hints: [],
        points: 100,
        active: true,
        stageIndex: 4,
    },
    {
        code: 'QR_GARDEN',
        isStartQR: false,
        linkedHintId: 'HINT_005',
        locationName: 'Campus Garden',
        hints: [],
        points: 100,
        active: true,
        stageIndex: 5,
    },
];

// Helper function to generate QR code as base64 data URL
const generateQRCode = async (data) => {
    try {
        // Generate QR code as data URL (base64)
        const qrCodeDataURL = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

const seedGameData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing hints and QRs (optional - comment out if you want to keep existing data)
        console.log('\n🗑️  Clearing existing game data...');
        await Hint.deleteMany({});
        await QRStage.deleteMany({});
        console.log('✅ Cleared existing data');

        // Seed Hints
        console.log('\n🎯 Seeding hints...');
        const createdHints = await Hint.insertMany(sampleHints);
        console.log(`✅ Created ${createdHints.length} hints`);

        // Seed QR Codes with generated QR images
        console.log('\n📱 Generating and seeding QR codes...');
        const qrCodesWithImages = await Promise.all(
            sampleQRs.map(async (qr) => {
                console.log(`   Generating QR for: ${qr.code}`);
                const qrCodeImage = await generateQRCode(qr.code);
                return {
                    ...qr,
                    qrCodeImage
                };
            })
        );

        const createdQRs = await QRStage.insertMany(qrCodesWithImages);
        console.log(`✅ Created ${createdQRs.length} QR codes with scannable images`);

        console.log('\n🎉 Game data seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`   Hints: ${createdHints.length}`);
        console.log(`   QR Codes: ${createdQRs.length}`);
        console.log(`   Start QR: START`);
        console.log('\n💡 Teams can now:');
        console.log('   1. Scan START QR to begin');
        console.log('   2. Get random hints');
        console.log('   3. Find and scan matching QR codes');
        console.log('   4. Earn points and progress through the hunt!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

// Run the seed function
seedGameData();
