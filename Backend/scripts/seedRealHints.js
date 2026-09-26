require('dotenv').config();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Hint = require('../src/models/Hint');
const QRStage = require('../src/models/QRStage');

// Real hints from allHints.js - 20 locations
const realHints = [
    {
        hintId: 'HINT_001',
        location: "2nd Floor, in front of the Director's Den",
        text: "He rules the land, again and again. Every Friday he takes his throne, Find the spot where power's shown.",
        qrId: 'QR_DIRECTORS_DEN',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_002',
        location: "Near C-Lab & ECE Lab-2",
        text: "CSE meets ECE — what a crew! Techies walk and codes align, Find the merge, where brains combine.",
        qrId: 'QR_CLAB_ECE',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_003',
        location: "Stairs before the Acad Office Door",
        text: "Up or down, you can't ignore, Every step may hide a clue — Watch your step, it's watching you!",
        qrId: 'QR_ACAD_STAIRS',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_004',
        location: "Basement by the TT Table",
        text: "Paddle kings if you are able, Sharath Kamal's vibe is here, Smash your way — the clue is near!",
        qrId: 'QR_TT_TABLE',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_005',
        location: "Trophy Place",
        text: "Shiny, bright, they stand so tall, Dreams in metal, pride in hall. Where winners' names forever stay, A hidden hint may light your way.",
        qrId: 'QR_TROPHY',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_006',
        location: "Where Packages Rest",
        text: "Amazon, Myntra, flip and flop, All your cravings make a stop. Among the boxes, take a peek — The clue you want is what you seek.",
        qrId: 'QR_PACKAGE_AREA',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_007',
        location: "Gym",
        text: "Where dreams are buff but bodies are not, You plan to come, but often forgot. Weights are waiting, music's loud, Search this place — make your mom proud!",
        qrId: 'QR_GYM',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_008',
        location: "Construction Site",
        text: "Blue walls guard a secret tight, No entry! warns the sign in sight. Digging deep and rules to obey — Find the clue where workers play!",
        qrId: 'QR_CONSTRUCTION',
        points: 100,
        hintType: 'text',
        difficulty: 'hard',
    },
    {
        hintId: 'HINT_009',
        location: "I Love IIIT Spot",
        text: "The only place where our college is loved.",
        qrId: 'QR_ILOVE_IIIT',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_010',
        location: "Pillar Opposite MEMS Lab (1st Floor)",
        text: "Science and circuits fill this space, The costliest lab in the whole place. Its doors stay shut, week after week — The clue hides where entry's unique!",
        qrId: 'QR_MEMS_PILLAR',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_011',
        location: "Tree with No Leaves",
        text: "Once full of leaves, now standing dry, No shade to give, though it still stands high. Look down below, don't pass it by — Your clue hides where on the tree no leaves lie!",
        qrId: 'QR_DRY_TREE',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_012',
        location: "Library",
        text: "All the knowledge, books galore, Yet the clue you want's not in a drawer. Read or sleep, it's your call — The hint's where silence fills the hall.",
        qrId: 'QR_LIBRARY',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_013',
        location: "G05 Corner, Near the Gate Wall",
        text: "Most goated class — respect it all. Near the wall, not too far, Look around and you will find a QR.",
        qrId: 'QR_G05_CORNER',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_014',
        location: "Empty Locker 108",
        text: "No key, no lock, no heavy weight, A safe that's open — what a fate! Peek inside, don't hesitate, Your hidden hint will celebrate!",
        qrId: 'QR_LOCKER_108',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_015',
        location: "4:15 Break — Basement Shop",
        text: "Chips, chai, and tales that pop, Recharge lite, but vibes don't stop. Grab a bite, look around — That's where your next clue's found!",
        qrId: 'QR_BASEMENT_SHOP',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
    {
        hintId: 'HINT_016',
        location: "Washbasin near the Music Room",
        text: "Melodies echo, beats go boom, Wash your hands or hum a tune, Your next clue sings — find it soon!",
        qrId: 'QR_MUSIC_WASHBASIN',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_017',
        location: "Behind the Freshers Banner",
        text: "What's trending now? What's the planner? Flip it 'round, don't be a scanner — Truth's behind what's front in manner!",
        qrId: 'QR_FRESHERS_BANNER',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_018',
        location: "Recharge Point (Canteen Area)",
        text: "You'll see it on paper but not on your plate, The chef's imagination decides your fate. What's promised in ink may never appear — Find the place where Out of Stock is always near!",
        qrId: 'QR_RECHARGE_POINT',
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
    },
    {
        hintId: 'HINT_019',
        location: "Room G06 - Hanging AC",
        text: "It hums above, keeping you cool, But one wrong move — and gravity rules! Look up, my friend, in room G06, The cold breeze blows, but it's quite a risky fix!",
        qrId: 'QR_G06_AC',
        points: 100,
        hintType: 'text',
        difficulty: 'hard',
    },
    {
        hintId: 'HINT_020',
        location: "Street Lights",
        text: "Countless in number, they guard the way, When the sun takes rest, they rule the day. Standing tall, they gleam so bright — Follow their glow to conquer the night!",
        qrId: 'QR_STREET_LIGHTS',
        points: 100,
        hintType: 'text',
        difficulty: 'easy',
    },
];

// QR codes for each location + START QR
const qrCodes = [
    {
        code: 'START',
        isStartQR: true,
        locationName: 'Start Point - Main Entrance',
        hints: [],
        points: 0,
        active: true,
        stageIndex: 0,
    },
    ...realHints.map((hint, index) => ({
        code: hint.qrId,
        isStartQR: false,
        linkedHintId: hint.hintId,
        locationName: hint.location,
        hints: [],
        points: 100,
        active: true,
        stageIndex: index + 1,
    }))
];

// Helper function to generate QR code as base64 data URL
const generateQRCode = async (data) => {
    try {
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

const seedRealHints = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing hints and QRs
        console.log('\n🗑️  Clearing existing game data...');
        await Hint.deleteMany({});
        await QRStage.deleteMany({});
        console.log('✅ Cleared existing data');

        // Seed Real Hints
        console.log('\n🎯 Seeding 20 real hints...');
        const createdHints = await Hint.insertMany(realHints);
        console.log(`✅ Created ${createdHints.length} hints`);

        // Seed QR Codes with generated QR images
        console.log('\n📱 Generating and seeding QR codes...');
        const qrCodesWithImages = await Promise.all(
            qrCodes.map(async (qr) => {
                console.log(`   Generating QR for: ${qr.code} (${qr.locationName})`);
                const qrCodeImage = await generateQRCode(qr.code);
                return {
                    ...qr,
                    qrCodeImage
                };
            })
        );

        const createdQRs = await QRStage.insertMany(qrCodesWithImages);
        console.log(`✅ Created ${createdQRs.length} QR codes with scannable images`);

        console.log('\n🎉 Real game data seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`   Hints: ${createdHints.length}`);
        console.log(`   QR Codes: ${createdQRs.length}`);
        console.log(`   Start QR: START`);

        console.log('\n📍 Locations:');
        realHints.forEach((h, i) => {
            console.log(`   ${i + 1}. ${h.location} (${h.qrId})`);
        });

        console.log('\n💡 Teams can now:');
        console.log('   1. Scan START QR to begin');
        console.log('   2. Get random hints from 20 real locations');
        console.log('   3. Find and scan matching QR codes');
        console.log('   4. Earn 100 points per correct scan!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedRealHints();
