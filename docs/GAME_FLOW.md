# 🎮 New Game Flow - Treasure Hunt System

## 📋 Overview

The QR-Hint system has been revamped into a **dynamic treasure-hunt flow** where teams:

1. Start by scanning a START QR
2. Receive random hints from a pool
3. Find and scan the correct QR matching the hint
4. Earn points for correct scans, lose points for wrong scans
5. Progress through the hunt by following the hint chain

---

## 🗄️ Database Models

### 1. **Hint Model** (NEW)

```javascript
{
  hintId: "HINT_001",           // Unique identifier
  text: "Find the library...",  // Riddle/clue text
  qrId: "QR_LIBRARY",          // Which QR this leads to
  points: 15,                   // Points if correct QR scanned
  usedByTeams: ["team1", ...], // Teams who used this hint
  hintType: "text",            // text/image/video
  difficulty: "medium",         // easy/medium/hard
  active: true                  // Is hint active
}
```

### 2. **QRStage Model** (UPDATED)

```javascript
{
  code: "QR_LIBRARY",          // QR identifier
  isStartQR: false,            // NEW: Is this the start QR?
  linkedHintId: "HINT_001",    // NEW: Which hint leads here
  locationName: "Library",     // NEW: Human-readable name
  hints: [],                   // Empty for new flow
  points: 100,
  active: true
}
```

### 3. **Team Model** (UPDATED)

```javascript
{
  // ... existing fields ...
  currentHintId: "HINT_002",   // NEW: Active hint to follow
  hintLog: [                   // NEW: Complete hint history
    {
      hintId: "HINT_001",
      hintText: "...",
      status: "completed",     // active/completed/wrong
      qrScanned: "QR_LIBRARY",
      pointsEarned: 15,
      timestamp: Date
    }
  ],
  scannedQRs: ["START", ...],  // NEW: All scanned QRs
  wrongScans: 2                // NEW: Count of wrong scans
}
```

---

## 🚀 API Endpoints

### **Game Endpoints** (NEW)

#### 1. Start Game

```http
POST /api/game/start
Authorization: Bearer <token>

Body:
{
  "qrId": "START"
}

Response:
{
  "success": true,
  "message": "Game started!",
  "hint": {
    "id": "HINT_001",
    "text": "Find the library entrance...",
    "type": "text"
  },
  "team": {
    "points": 0,
    "currentHintId": "HINT_001",
    "hintsCollected": 1
  }
}
```

#### 2. Scan QR Code

```http
POST /api/game/scan
Authorization: Bearer <token>

Body:
{
  "qrId": "QR_LIBRARY"
}

Response (CORRECT):
{
  "success": true,
  "status": "correct",
  "message": "Correct! You earned 15 points.",
  "pointsAwarded": 15,
  "team": {
    "points": 15,
    "hintsCompleted": 1,
    "totalHints": 2
  },
  "nextHint": {
    "id": "HINT_002",
    "text": "Go to the third floor...",
    "type": "text"
  },
  "gameCompleted": false
}

Response (WRONG):
{
  "success": false,
  "status": "wrong",
  "message": "Wrong QR code! You lost 5 points.",
  "pointsDeducted": 5,
  "team": {
  "points": -20,
    "wrongScans": 1
  },
  "currentHint": {
    "id": "HINT_001",
    "text": "Find the library entrance...",
    "type": "text"
  }
}
```

#### 3. Get Game Logs

```http
GET /api/game/logs
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "team": {
      "id": "...",
      "name": "Team Alpha",
      "points": 45
    },
    "currentHint": {
      "id": "HINT_003",
      "text": "...",
      "receivedAt": "2025-11-05T10:15:00Z"
    },
    "progress": {
      "hintsCompleted": 2,
      "totalHints": 3,
      "wrongScans": 1,
      "qrsScanned": 3
    },
    "hintLog": [
      {
        "hintId": "HINT_001",
        "hintText": "...",
        "status": "completed",
        "qrScanned": "QR_LIBRARY",
        "pointsEarned": 15,
        "timestamp": "..."
      },
      // ...more logs
    ]
  }
}
```

#### 4. Get Current Hint

```http
GET /api/game/current-hint
Authorization: Bearer <token>

Response:
{
  "success": true,
  "currentHint": {
    "id": "HINT_002",
    "text": "Go to the third floor...",
    "type": "text"
  }
}
```

---

### **Admin Endpoints** (NEW)

#### Hint Management

```http
# Get all hints
GET /api/admin/hints

# Create hint
POST /api/admin/hints
Body: {
  "hintId": "HINT_006",
  "text": "Find the rooftop...",
  "qrId": "QR_ROOF",
  "points": 25,
  "hintType": "text",
  "difficulty": "hard"
}

# Update hint
PATCH /api/admin/hints/:id
Body: { "points": 30, "active": false }

# Delete hint
DELETE /api/admin/hints/:id

# Get single hint
GET /api/admin/hints/:id
```

---

## 🎮 Game Flow

### **Step-by-Step**

```
1. Team Registration
   └── POST /api/auth/register
   └── Team created with points: 0

2. Start Game
   └── Team scans START QR
   └── POST /api/game/start { qrId: "START" }
   └── Receives random hint: "HINT_001"
   └── currentHintId set to "HINT_001"

3. Follow Hint
   └── Team reads: "Find the library entrance..."
   └── Team goes to library

4. Scan QR (Correct)
   └── Team scans QR_LIBRARY
   └── POST /api/game/scan { qrId: "QR_LIBRARY" }
   └── Backend checks: currentHint.qrId === "QR_LIBRARY" ✓
   └── Points awarded: +15
   └── Next hint given: "HINT_002"

5. Scan QR (Wrong)
   └── Team accidentally scans QR_CAFE
   └── POST /api/game/scan { qrId: "QR_CAFE" }
   └── Backend checks: currentHint.qrId === "QR_CAFE" ✗
  └── Points deducted: -20
   └── Hint remains: "HINT_002" (no progress)

6. Continue Until Completion
   └── Team follows hints correctly
   └── Collects all hints from pool
   └── gameCompleted: true
```

---

## 📊 Points System

| Action         | Points       | Description                       |
| -------------- | ------------ | --------------------------------- |
| Start Game     | 0            | No points for starting            |
| Correct QR     | +hint.points | From hint definition (10-25)      |
| Wrong QR       | -20          | Configurable in pointsConfig.json |
| Duplicate Scan | 0            | Already scanned QRs ignored       |

---

## 🛠️ Setup Instructions

### 1. Run Database Migrations

```bash
# The models are backward compatible
# Existing teams will have new fields as null/empty
```

### 2. Seed Game Data

```bash
npm run seed:game
# or
node scripts/seedGameData.js
```

This creates:

- 1 START QR
- 5 QR codes (Library, Lab, Cafe, Auditorium, Garden)
- 5 Hints pointing to those QRs

### 3. Configure Points

Edit `src/config/pointsConfig.json`:

```json
{
  "gameplay": {
    "wrongQRPenalty": 10
  }
}
```

### 4. Start Server

```bash
npm start
# or
npm run dev
```

---

## 🔄 Backward Compatibility

The old `/api/scan` endpoint still exists for backward compatibility.

**New teams should use:**

- `/api/game/start` - Start the hunt
- `/api/game/scan` - Scan QRs during the hunt
- `/api/game/logs` - View progress

**Old endpoint (deprecated):**

- `/api/scan` - Old random hint system

---

## 📱 Frontend Integration

### Update Scan Flow

```javascript
// 1. Start Game (one-time)
const startResponse = await fetch("/api/game/start", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ qrId: "START" }),
});

const { hint } = await startResponse.json();
// Display hint.text to user

// 2. Scan QR codes
const scanResponse = await fetch("/api/game/scan", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ qrId: scannedCode }),
});

const result = await scanResponse.json();

if (result.status === "correct") {
  // Show success + next hint
  showHint(result.nextHint.text);
  updatePoints(result.pointsAwarded);
} else {
  // Show error + current hint reminder
  showError(result.message);
  showHint(result.currentHint.text);
}

// 3. View Progress
const logsResponse = await fetch("/api/game/logs", {
  headers: { Authorization: `Bearer ${token}` },
});

const { data } = await logsResponse.json();
// Display data.hintLog, progress, etc.
```

---

## 🎯 Admin Usage

### Create Custom Hunt

```javascript
// 1. Create Hints
POST /api/admin/hints
[
  {
    hintId: "CUSTOM_001",
    text: "Find the secret room...",
    qrId: "QR_SECRET",
    points: 50
  },
  // ... more hints
]

// 2. Create QR Codes
POST /api/admin/qr
[
  {
    code: "START",
    isStartQR: true,
    locationName: "Main Gate"
  },
  {
    code: "QR_SECRET",
    linkedHintId: "CUSTOM_001",
    locationName: "Secret Room"
  }
]

// 3. Teams can now start the hunt!
```

---

## 🐛 Troubleshooting

### Issue: "Game not started"

**Solution:** Team must scan START QR first

```http
POST /api/game/start { qrId: "START" }
```

### Issue: "No hints available"

**Solution:** Seed hints using the script

```bash
node scripts/seedGameData.js
```

### Issue: "Hint not found"

**Solution:** Verify hint exists and is active

```http
GET /api/admin/hints
```

### Issue: All hints used

**Solution:** Hints can only be used once per team. Reset team's hintLog via admin panel.

---

## 📈 Future Enhancements

- [ ] Time-based hints (hints expire after X minutes)
- [ ] Hint difficulty multipliers
- [ ] Team collaboration (share hints)
- [ ] Hint purchasing system (spend points for hints)
- [ ] Leaderboard based on completion time
- [ ] Real-time notifications when teams scan QRs

---

## 📞 Support

For issues or questions:

1. Check the logs: `data.hintLog` endpoint
2. Verify hint pool: `GET /api/admin/hints`
3. Check team status: `GET /api/game/logs`
4. Contact admin

---

**🎉 Happy Treasure Hunting!**
