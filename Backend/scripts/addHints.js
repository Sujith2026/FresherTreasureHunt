require('dotenv').config();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const QRStage = require('../src/models/QRStage');
const Hint = require('../src/models/Hint');

// =====================
// Paste your hints below
// =====================
const hints = [
  {
    location: "2nd Floor, in front of the Director's Den",
    hint: "He rules the land, again and again. Every Friday he takes his throne, Find the spot where power's shown."
  },
  {
    location: "Near C-Lab & ECE Lab-2",
    hint: "CSE meets ECE — what a crew! Techies walk and codes align, Find the merge, where brains combine."
  },
  {
    location: "Stairs before the Acad Office Door",
    hint: "Up or down, you can't ignore, Every step may hide a clue — Watch your step, it's watching you!"
  },
  {
    location: "Basement by the TT Table",
    hint: "Paddle kings if you are able, Sharath Kamal's vibe is here, Smash your way — the clue is near!"
  },
  {
    location: "Trophy Place",
    hint: "Shiny, bright, they stand so tall, Dreams in metal, pride in hall. Where winners' names forever stay, A hidden hint may light your way."
  },
  {
    location: "Where Packages Rest",
    hint: "Amazon, Myntra, flip and flop, All your cravings make a stop. Among the boxes, take a peek — The clue you want is what you seek."
  },
  {
    location: "Gym",
    hint: "Where dreams are buff but bodies are not, You plan to come, but often forgot. Weights are waiting, music's loud, Search this place — make your mom proud!"
  },
  {
    location: "Construction Site",
    hint: "Blue walls guard a secret tight, No entry! warns the sign in sight. Digging deep and rules to obey — Find the clue where workers play!"
  },
  {
    location: "I Love IIIT Spot",
    hint: "The only place where our college is loved."
  },
  {
    location: "Pillar Opposite MEMS Lab (1st Floor)",
    hint: "Science and circuits fill this space, The costliest lab in the whole place. Its doors stay shut, week after week — The clue hides where entry's unique!"
  },
  {
    location: "Tree with No Leaves",
    hint: "Once full of leaves, now standing dry, No shade to give, though it still stands high. Look down below, don't pass it by — Your clue hides where on the tree no leaves lie!"
  },
  {
    location: "Library",
    hint: "All the knowledge, books galore, Yet the clue you want's not in a drawer. Read or sleep, it's your call — The hint's where silence fills the hall."
  },
  {
    location: "G05 Corner, Near the Gate Wall",
    hint: "Most goated class — respect it all. Near the wall, not too far, Look around and you will find a QR."
  },
  {
    location: "Empty Locker 108",
    hint: "No key, no lock, no heavy weight, A safe that's open — what a fate! Peek inside, don't hesitate, Your hidden hint will celebrate!"
  },
  {
    location: "4:15 Break — Basement Shop",
    hint: "Chips, chai, and tales that pop, Recharge lite, but vibes don't stop. Grab a bite, look around — That's where your next clue's found!"
  },
  {
    location: "Washbasin near the Music Room",
    hint: "Melodies echo, beats go boom, Wash your hands or hum a tune, Your next clue sings — find it soon!"
  },
  {
    location: "Behind the Freshers Banner",
    hint: "What's trending now? What's the planner? Flip it 'round, don't be a scanner — Truth's behind what's front in manner!"
  },
  {
    location: "Recharge Point (Canteen Area)",
    hint: "You'll see it on paper but not on your plate, The chef's imagination decides your fate. What's promised in ink may never appear — Find the place where Out of Stock is always near!"
  },
  {
    location: "Room G06 - Hanging AC",
    hint: "It hums above, keeping you cool, But one wrong move — and gravity rules! Look up, my friend, in room G06, The cold breeze blows, but it's quite a risky fix!"
  },
  {
    location: "Street Lights",
    hint: "Countless in number, they guard the way, When the sun takes rest, they rule the day. Standing tall, they gleam so bright — Follow their glow to conquer the night!"
  }
];

const generateQRCodeName = (location) => {
  return 'QR_' + location
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
};

const generateQRCodeImage = async (code) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(code, {
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
    console.error('Error generating QR code image:', error);
    throw error;
  }
};

const addHintsToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing existing data...');
    const deleteQRResult = await QRStage.deleteMany({});
    const deleteHintResult = await Hint.deleteMany({});
    console.log(`✅ Cleared ${deleteQRResult.deletedCount} QR codes`);
    console.log(`✅ Cleared ${deleteHintResult.deletedCount} Hints`);

    console.log('\n📱 Creating START QR code...');
    // Create START QR first
    const startQRImage = await generateQRCodeImage('START');
    const startQR = await QRStage.create({
      code: 'START',
      locationName: 'Start Point - Main Entrance',
      isStartQR: true,
      linkedHintId: null,
      hints: [],
      hintType: 'text',
      points: 0,
      active: true,
      scanCount: 0,
      stageIndex: 0,
      qrCodeImage: startQRImage,
      description: 'Start QR - Scan this to begin the treasure hunt'
    });
    console.log('✅ Created START QR code');

    console.log('\n📱 Creating Hints and QR codes...\n');
    const hintDocuments = [];
    const qrDocuments = [];

    for (let i = 0; i < hints.length; i++) {
      const { location, hint } = hints[i];
      const qrCode = generateQRCodeName(location);
      const hintId = 'HINT_' + String(i + 1).padStart(3, '0');

      console.log(`[${i + 1}/${hints.length}] Processing: ${location}`);
      console.log(`   QR Code: ${qrCode}`);
      console.log(`   Hint ID: ${hintId}`);

      // Generate scannable QR code image
      const qrCodeImage = await generateQRCodeImage(qrCode);

      // Create Hint document
      const hintDoc = {
        hintId: hintId,
        text: hint,
        qrId: qrCode,
        points: 100,
        hintType: 'text',
        difficulty: 'medium',
        active: true,
        usedByTeams: []
      };

      // Create QR document with new format
      const qrDoc = {
        code: qrCode,
        locationName: location,
        linkedHintId: hintId,  // Link to the hint
        isStartQR: false,
        hints: [],  // Empty for new game flow
        hintType: 'text',
        points: 100,
        active: true,
        scanCount: 0,
        stageIndex: i + 1,
        qrCodeImage: qrCodeImage,
        description: 'QR Code for ' + location
      };

      hintDocuments.push(hintDoc);
      qrDocuments.push(qrDoc);
    }

    // Insert Hints first
    const createdHints = await Hint.insertMany(hintDocuments);
    console.log(`\n✅ Created ${createdHints.length} Hints in database`);

    // Insert QR codes
    const createdQRs = await QRStage.insertMany(qrDocuments);
    console.log(`✅ Created ${createdQRs.length} QR codes in database`);

    // Print summary
    console.log('\n📋 Summary:');
    console.log('='.repeat(60));
    console.log('START QR: START (Scan to begin treasure hunt)');
    console.log('');
    createdQRs.forEach((qr, idx) => {
      const correspondingHint = createdHints[idx];
      console.log(`${idx + 1}. ${qr.locationName}`);
      console.log(`   QR Code: ${qr.code}`);
      console.log(`   Hint ID: ${correspondingHint.hintId}`);
      console.log(`   Points: ${qr.points}`);
      console.log(`   Hint: ${correspondingHint.text.substring(0, 50)}...`);
      console.log('');
    });
    console.log('='.repeat(60));
    console.log('\n🎉 All hints and QR codes added successfully!');
    console.log('💡 Game flow ready:');
    console.log('   1. Teams scan START QR to begin');
    console.log('   2. System assigns random hints');
    console.log('   3. Teams find and scan matching QR codes');
    console.log('   4. Points awarded for correct scans');
    console.log('\n📊 Total: 1 START QR + ' + createdHints.length + ' Hints + ' + createdQRs.length + ' QR codes\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding hints:', error);
    process.exit(1);
  }
};

addHintsToDatabase();
