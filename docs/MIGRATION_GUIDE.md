# 🔄 Migration Guide: Old System → New Treasure Hunt System

## Overview

This guide helps you migrate from the old random hint system to the new sequential treasure hunt flow.

---

## ⚠️ Breaking Changes

### API Endpoints

| Old Endpoint     | New Endpoint                 | Status                       |
| ---------------- | ---------------------------- | ---------------------------- |
| `POST /api/scan` | `POST /api/game/scan`        | Old still works (deprecated) |
| N/A              | `POST /api/game/start`       | **NEW** - Required to start  |
| N/A              | `GET /api/game/logs`         | **NEW** - View hint history  |
| N/A              | `GET /api/game/current-hint` | **NEW** - Get active hint    |

### Response Structure

**Old `/api/scan` response:**

```json
{
  "success": true,
  "pointsAwarded": 100,
  "hintValue": "Random hint from pool",
  "hintId": "QR_001:2"
}
```

**New `/api/game/scan` response:**

```json
{
  "success": true,
  "status": "correct", // NEW: or "wrong"
  "pointsAwarded": 15, // or pointsDeducted
  "nextHint": {
    // NEW: structured hint
    "id": "HINT_002",
    "text": "Go to the lab...",
    "type": "text"
  }
}
```

---

## 📋 Migration Steps

### Step 1: Update Database Models

The new fields are **backward compatible**. Existing teams will have:

- `currentHintId: null`
- `hintLog: []`
- `scannedQRs: []`
- `wrongScans: 0`

**Action Required:** None - models auto-migrate on server start.

---

### Step 2: Seed Game Data

Create the hint pool and QR codes:

```bash
npm run seed:game
```

This creates:

- 1 START QR
- 5 location QRs
- 5 hints

**Customize the data** in `scripts/seedGameData.js` before running.

---

### Step 3: Update Frontend Code

#### Old Flow:

```javascript
// Direct scan
const response = await fetch("/api/scan", {
  method: "POST",
  body: JSON.stringify({ qrCode: "QR_001" }),
});
```

#### New Flow:

```javascript
// 1. First, start the game (one-time)
const startRes = await fetch("/api/game/start", {
  method: "POST",
  body: JSON.stringify({ qrId: "START" }),
});
const { hint } = await startRes.json();

// 2. Then scan other QRs
const scanRes = await fetch("/api/game/scan", {
  method: "POST",
  body: JSON.stringify({ qrId: scannedCode }),
});

const result = await scanRes.json();
if (result.status === "correct") {
  // Show next hint
} else {
  // Show error, keep current hint
}
```

---

### Step 4: Update UI Components

#### Add Start Button

```jsx
<Button
  onClick={async () => {
    const res = await scanService.startGame("START");
    setCurrentHint(res.hint);
  }}
>
  Start Hunt
</Button>
```

#### Display Current Hint

```jsx
<div className="current-hint">
  <h3>Your Current Clue:</h3>
  <p>{currentHint?.text}</p>
</div>
```

#### Show Hint History

```jsx
<div className="hint-history">
  {hintLog.map((log) => (
    <div key={log.hintId} className={log.status}>
      <p>{log.hintText}</p>
      <span>{log.status === "completed" ? "✓" : "✗"}</span>
      <span>{log.pointsEarned} pts</span>
    </div>
  ))}
</div>
```

#### Handle Wrong Scans

```jsx
if (scanResult.status === "wrong") {
  toast.error(`Wrong QR! -${scanResult.pointsDeducted} points`);
  // Keep showing current hint
  setCurrentHint(scanResult.currentHint);
} else {
  toast.success(`Correct! +${scanResult.pointsAwarded} points`);
  setCurrentHint(scanResult.nextHint);
}
```

---

### Step 5: Update Services

#### scanService.js

```javascript
const scanService = {
  // NEW: Start game
  startGame: async (qrId) => {
    return await apiClient.post("/game/start", { qrId });
  },

  // NEW: Scan with validation
  scanQR: async (qrId) => {
    return await apiClient.post("/game/scan", { qrId });
  },

  // NEW: Get hint logs
  getLogs: async () => {
    return await apiClient.get("/game/logs");
  },

  // NEW: Get current hint
  getCurrentHint: async () => {
    return await apiClient.get("/game/current-hint");
  },

  // OLD: Keep for backward compatibility (optional)
  scanQROld: async (qrCode) => {
    return await apiClient.post("/scan", { qrCode });
  },
};
```

---

### Step 6: Admin Panel Updates

Add hint management UI:

```jsx
// Admin Hints Page
const AdminHints = () => {
  const [hints, setHints] = useState([]);

  useEffect(() => {
    const loadHints = async () => {
      const res = await adminService.getAllHints();
      setHints(res.data.hints);
    };
    loadHints();
  }, []);

  return (
    <div>
      <h2>Manage Hints</h2>
      <button onClick={() => showCreateForm()}>Create Hint</button>

      {hints.map((hint) => (
        <div key={hint.hintId}>
          <h4>{hint.hintId}</h4>
          <p>{hint.text}</p>
          <p>
            → {hint.qrId} ({hint.points} pts)
          </p>
          <button onClick={() => editHint(hint)}>Edit</button>
          <button onClick={() => deleteHint(hint._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

### Step 7: Update Admin Service

```javascript
const adminService = {
  // ... existing methods ...

  // NEW: Hint management
  getAllHints: async () => {
    return await apiClient.get("/admin/hints");
  },

  createHint: async (hintData) => {
    return await apiClient.post("/admin/hints", hintData);
  },

  updateHint: async (hintId, updates) => {
    return await apiClient.patch(`/admin/hints/${hintId}`, updates);
  },

  deleteHint: async (hintId) => {
    return await apiClient.delete(`/admin/hints/${hintId}`);
  },
};
```

---

## 🔀 Coexistence Strategy

Both systems can run **simultaneously**:

### Option 1: Feature Flag

```javascript
// In frontend
const USE_NEW_GAME_FLOW = true;

if (USE_NEW_GAME_FLOW) {
  // Use /api/game/* endpoints
} else {
  // Use old /api/scan endpoint
}
```

### Option 2: Separate Modes

```javascript
// Backend: Check if team has started new flow
if (team.currentHintId) {
  // New flow: must use /api/game/scan
} else {
  // Old flow: can use /api/scan
}
```

---

## 📊 Data Migration

### Migrate Existing Teams

Run this script to migrate existing teams to new system:

```javascript
// scripts/migrateTeams.js
const Team = require("../src/models/Team");

async function migrateTeams() {
  const teams = await Team.find();

  for (const team of teams) {
    team.currentHintId = null;
    team.hintLog = [];
    team.scannedQRs = team.scannedHints || [];
    team.wrongScans = 0;

    await team.save();
  }

  console.log(`Migrated ${teams.length} teams`);
}

migrateTeams();
```

---

## ✅ Testing Checklist

- [ ] Start game with START QR
- [ ] Receive random hint
- [ ] Scan correct QR → earn points, get next hint
- [ ] Scan wrong QR → lose points, keep current hint
- [ ] Scan duplicate QR → rejected
- [ ] View hint logs → see history
- [ ] Complete all hints → game completed
- [ ] Admin create/edit/delete hints
- [ ] Leaderboard shows updated points

---

## 🐛 Common Issues

### Issue: "Game not started"

**Cause:** Team didn't scan START QR first  
**Fix:** Ensure frontend calls `/api/game/start` before scanning

### Issue: "No hints available"

**Cause:** Hint pool not seeded  
**Fix:** Run `npm run seed:game`

### Issue: Points not updating

**Cause:** Using old `/api/scan` instead of new `/api/game/scan`  
**Fix:** Update frontend to use new endpoints

---

## 📞 Rollback Plan

If you need to rollback:

1. Comment out new routes in `src/app.js`:

```javascript
// app.use('/api/game', gameRoutes);
```

2. Revert frontend to old `scanService`

3. Teams will continue using old flow

**Note:** New teams will have empty new fields, but this won't break anything.

---

## 🎉 Migration Complete!

After migration, teams will:

- ✅ Start with START QR scan
- ✅ Follow sequential hint chain
- ✅ Earn/lose points for correct/wrong scans
- ✅ View complete hint history
- ✅ Experience dynamic treasure hunt gameplay

**Next Steps:**

1. Test with a sample team
2. Create custom hints for your event
3. Print QR codes for physical locations
4. Launch the hunt! 🏁
