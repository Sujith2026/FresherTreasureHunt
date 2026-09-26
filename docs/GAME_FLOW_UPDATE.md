# 🎮 Game Flow Update - No Start Event Required

## 📋 Summary of Changes

The treasure hunt system has been updated to **remove the "start event" requirement**. Teams can now begin playing **immediately** by scanning the START QR code, without waiting for an admin to manually start the event.

---

## ✅ What Changed

### Before (Old Flow)

```
1. Admin creates hints/QR codes
2. Teams login
3. ❌ Teams wait for admin to start event
4. Admin manually starts event via dashboard
5. Teams can now scan START QR
6. Game begins
```

### After (New Flow)

```
1. Admin creates hints/QR codes
2. Event is automatically active
3. Teams login
4. Teams scan START QR anytime ✅
5. Game begins immediately
6. Admin can end event when needed
```

---

## 🔧 Technical Changes

### 1. **Game Controller** (`src/controllers/gameController.js`)

- ✅ Removed `eventStatus === 'not_started'` check from `startGame()`
- ✅ Removed `eventStatus === 'not_started'` check from `scanQR()`
- ✅ Kept `eventStatus === 'ended'` check (admin can still end event)

**Before:**

```javascript
if (eventSettings.eventStatus === "not_started") {
  return { message: "Event hasn't started yet" };
}
if (eventSettings.eventStatus === "ended") {
  return { message: "Event has ended" };
}
```

**After:**

```javascript
// Only check if event has ended
if (eventSettings.eventStatus === "ended") {
  return { message: "Event has ended" };
}
```

### 2. **Reset Event Script** (`scripts/resetEvent.js`)

- ✅ No longer resets event status to 'not_started'
- ✅ Keeps event active for immediate play
- ✅ Still clears team progress, hints, and scan logs

**Updated behavior:**

```javascript
// Before: settings.eventStatus = 'not_started';
// After: Event stays active (no status change)
```

### 3. **New Initialization Script** (`scripts/initEvent.js`)

- ✅ New script to set event to active on first setup
- ✅ Run once: `npm run init:event`
- ✅ Ensures event is ready for teams to play

### 4. **Updated Documentation**

- ✅ Updated `scripts/README.md` with new workflow
- ✅ Added `init:event` to npm scripts
- ✅ Clarified that start event is optional

---

## 🎯 Game Flow (Updated)

### Phase 1: Team Scans START QR

```
Team opens app
  ↓
Team scans START QR (no waiting needed!)
  ↓
Backend checks:
  - Is event ended? (if yes, reject)
  - Is team eliminated? (if yes, reject)
  - Valid START QR? ✓
  ↓
Backend assigns random unused hint
  ↓
Team receives hint: "Find the library entrance..."
  ↓
currentHintId = "HINT_001"
```

### Phase 2: Scan Correct QR

```
Team scans QR_LIBRARY
  ↓
Backend checks: currentHint.qrId === "QR_LIBRARY"? ✓
  ↓
Points awarded: +100 points
  ↓
Mark HINT_001 as completed
  ↓
Assign new random hint (HINT_002)
  ↓
Team receives next hint
```

### Phase 3: Scan Wrong QR

```
Team scans QR_CAFE (wrong!)
  ↓
Backend checks: currentHint.qrId === "QR_CAFE"? ✗
  ↓
Points deducted: -20 points
  ↓
currentHintId stays same (no progress)
  ↓
Team must find correct QR
```

### Phase 4: Game Completion

```
Team completes final hint
  ↓
No more unused hints available
  ↓
gameCompleted: true
  ↓
Message: "Congratulations! Hunt complete!"
```

---

## 🚀 Setup Instructions (Updated)

### First Time Setup:

```bash
# 1. Create your hints
Edit scripts/addHints.js with your custom hints

# 2. Add hints to database
npm run seed:hints

# 3. Initialize event (set to active)
npm run init:event

# 4. Verify setup
npm run verify

# 5. Start backend
npm run dev
```

### For Testing:

```bash
# Reset event between test runs
npm run reset:event

# Teams can immediately start playing again!
```

---

## 📊 Event Status Flow

```
Initial State: not_started (default when created)
       ↓
   [Run init:event or admin starts manually]
       ↓
   Status: active (teams can scan START QR)
       ↓
   [Teams play the treasure hunt]
       ↓
   [Admin ends event via dashboard]
       ↓
   Status: ended (no more scans allowed)
```

---

## 🎮 API Behavior

### POST /api/game/start (Scan START QR)

**Before:**

- ❌ Rejected if `eventStatus === 'not_started'`
- ❌ Rejected if `eventStatus === 'ended'`

**After:**

- ✅ Allowed anytime (if event not ended)
- ❌ Rejected only if `eventStatus === 'ended'`

### POST /api/game/scan (Scan Location QR)

**Before:**

- ❌ Rejected if `eventStatus === 'not_started'`
- ❌ Rejected if `eventStatus === 'ended'`

**After:**

- ✅ Allowed anytime (if event not ended)
- ❌ Rejected only if `eventStatus === 'ended'`

---

## 👨‍💼 Admin Controls

Admins still have full control:

### ✅ What Admins Can Do:

1. **End Event**: `POST /api/admin/event/end`

   - Stops all scanning
   - Prevents new games from starting
   - Useful for event conclusion

2. **Monitor Progress**: All admin endpoints still work

   - View teams
   - View scan logs
   - View leaderboard
   - Manage hints and QR codes

3. **Optional Manual Start**: `POST /api/admin/event/start`
   - Still available if needed
   - Useful if you want to control exact start time
   - Not required by default

### ❌ What Changed for Admins:

- No longer **required** to manually start event
- Teams can begin playing as soon as they login
- Event can be active 24/7 if desired

---

## 📝 Scripts Reference

| Script       | Command               | Purpose                          |
| ------------ | --------------------- | -------------------------------- |
| Create Hints | `npm run seed:hints`  | Add custom hints and QR codes    |
| Init Event   | `npm run init:event`  | Set event to active (first time) |
| Reset Event  | `npm run reset:event` | Clear progress for new test      |
| Start Event  | `npm run start:event` | (Optional) Set to active         |
| Debug Event  | `npm run debug:event` | Troubleshoot issues              |
| Verify       | `npm run verify`      | Check system status              |

---

## 🔍 Migration Notes

### For Existing Deployments:

1. **Update backend code** (pull latest changes)
2. **Run init:event** to ensure event is active:
   ```bash
   npm run init:event
   ```
3. **Restart backend server**
4. **Teams can now play immediately**

### No Frontend Changes Required

The frontend doesn't need updates - it already calls the same API endpoints. The only difference is:

- **Before**: Teams got error "Event hasn't started yet"
- **After**: Teams can scan START QR anytime (unless event ended)

---

## ✅ Benefits

### For Teams:

- ✅ **Instant Play**: No waiting for admin
- ✅ **Better UX**: Scan START QR and go!
- ✅ **24/7 Availability**: Play anytime event is active

### For Admins:

- ✅ **Less Work**: No need to manually start
- ✅ **Flexibility**: Can still manually control if needed
- ✅ **Easier Testing**: Reset and test immediately

### For Developers:

- ✅ **Simpler Logic**: One less status check
- ✅ **Easier Testing**: No admin action needed in tests
- ✅ **Better Flow**: Teams self-serve

---

## 🎉 Summary

**The treasure hunt is now always ready to play!**

- ✅ Teams scan START QR anytime
- ✅ Game flow remains exactly the same
- ✅ Admin can still end event when needed
- ✅ Perfect for events running all day/week
- ✅ Better user experience

**Event Flow:**

```
Active (default) → Teams Play → Admin Ends (optional)
```
