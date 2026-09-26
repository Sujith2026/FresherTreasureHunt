require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const QRStage = require('../src/models/QRStage');
const Team = require('../src/models/Team');
const ScanLog = require('../src/models/ScanLog');

// Sample QR stages data
const qrStages = [
    {
        code: 'QR001-START',
        stageIndex: 1,
        hint: 'Look for the red door in the main hall',
        pointsForCorrect: 100,
        pointsForWrong: 20,
        description: 'Stage 1: Starting point',
        location: 'Main Hall',
        active: true,
    },
    {
        code: 'QR002-HALL',
        stageIndex: 2,
        hint: 'Check the bulletin board near the cafeteria',
        pointsForCorrect: 150,
        pointsForWrong: 25,
        description: 'Stage 2: Hall exploration',
        location: 'Cafeteria Area',
        active: true,
    },
    {
        code: 'QR003-LAB',
        stageIndex: 3,
        hint: 'Find the computer with a green sticky note',
        pointsForCorrect: 200,
        pointsForWrong: 30,
        description: 'Stage 3: Lab discovery',
        location: 'Computer Lab',
        active: true,
    },
    {
        code: 'QR004-LIBRARY',
        stageIndex: 4,
        hint: 'Search the mystery section on shelf 7',
        pointsForCorrect: 250,
        pointsForWrong: 35,
        description: 'Stage 4: Library quest',
        location: 'Library',
        active: true,
    },
    {
        code: 'QR005-GARDEN',
        stageIndex: 5,
        hint: 'Near the fountain in the center garden',
        pointsForCorrect: 300,
        pointsForWrong: 40,
        description: 'Stage 5: Garden hunt',
        location: 'Central Garden',
        active: true,
    },
    {
        code: 'QR006-FINISH',
        stageIndex: 6,
        hint: 'Congratulations! Return to the start for your prize!',
        pointsForCorrect: 500,
        pointsForWrong: 0,
        description: 'Final Stage: Victory!',
        location: 'Main Hall',
        active: true,
    },
];

// Sample teams (for testing)
const sampleTeams = [
    {
        teamName: 'Alpha Hunters',
        passwordHash: 'password123',
        members: [
            { name: 'John Doe', email: 'john@example.com', role: 'leader' },
            { name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
        ],
    },
    {
        teamName: 'Beta Squad',
        passwordHash: 'password123',
        members: [
            { name: 'Mike Johnson', email: 'mike@example.com', role: 'leader' },
            { name: 'Sarah Williams', email: 'sarah@example.com', role: 'member' },
        ],
    },
    {
        teamName: 'Gamma Force',
        passwordHash: 'password123',
        members: [
            { name: 'David Brown', email: 'david@example.com', role: 'leader' },
        ],
    },
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('\n🌱 Starting database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await QRStage.deleteMany({});
        await Team.deleteMany({});
        await ScanLog.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Seed QR stages
        console.log('📍 Seeding QR stages...');
        const createdStages = await QRStage.insertMany(qrStages);
        console.log(`✅ Created ${createdStages.length} QR stages\n`);

        // Seed sample teams (optional - comment out if not needed)
        console.log('👥 Seeding sample teams...');
        const createdTeams = await Team.insertMany(sampleTeams);
        console.log(`✅ Created ${createdTeams.length} sample teams\n`);

        // Display summary
        console.log('='.repeat(50));
        console.log('✨ Database seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - QR Stages: ${createdStages.length}`);
        console.log(`   - Sample Teams: ${createdTeams.length}`);
        console.log('\n🔐 Sample Team Credentials:');
        console.log('   Team Name: Alpha Hunters');
        console.log('   Password: password123');
        console.log('\n📝 QR Codes Available:');
        createdStages.forEach((stage) => {
            console.log(`   Stage ${stage.stageIndex}: ${stage.code} (${stage.pointsForCorrect} pts)`);
        });
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
