# ✅ SETUP COMPLETE - TREASURE HUNT SYSTEM

## 🎉 Current Status

✅ **Database Setup**: Complete

- 20 Hints created (HINT_001 to HINT_020)
- 21 QR Codes created (1 START + 20 location QRs)
- All QR codes have scannable images generated
- Hints properly linked to QR codes

✅ **Event Status**: Ready to start

- Current status: `not_started`
- Admin needs to start the event

---

## 🚀 QUICK START GUIDE

### For Admin:

1. **Start the Backend Server** (if not already running):

   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the Event**:

   - Go to Admin Dashboard
   - Navigate to Event Control
   - Click "Start Event"

   OR use API:

   ```bash
   POST /api/admin/event/start
   ```

3. **View QR Codes**:
   - Admin Dashboard → QR Management
   - Download and print QR codes
   - Place them at the specified locations

### For Teams:

1. **Register**:

   ```
   POST /api/auth/register
   ```

2. **Scan START QR**:

   - Scan the START QR code
   - System will give first random hint

   ```
   POST /api/game/start
   Body: { "qrId": "START" }
   ```

3. **Follow Hints and Scan QRs**:
   - Read the hint
   - Find the location
   - Scan the QR code
   ```
   POST /api/game/scan
   Body: { "qrId": "QR_LIBRARY" }
   ```

---

## 📊 DATA SUMMARY

### Hints Created:

```
HINT_001 → QR_2ND_FLOOR_IN_FRONT_OF_THE_DIRECTORS_DEN
HINT_002 → QR_NEAR_CLAB_ECE_LAB2
HINT_003 → QR_STAIRS_BEFORE_THE_ACAD_OFFICE_DOOR
HINT_004 → QR_BASEMENT_BY_THE_TT_TABLE
HINT_005 → QR_TROPHY_PLACE
HINT_006 → QR_WHERE_PACKAGES_REST
HINT_007 → QR_GYM
HINT_008 → QR_CONSTRUCTION_SITE
HINT_009 → QR_I_LOVE_IIIT_SPOT
HINT_010 → QR_PILLAR_OPPOSITE_MEMS_LAB_1ST_FLOOR
HINT_011 → QR_TREE_WITH_NO_LEAVES
HINT_012 → QR_LIBRARY
HINT_013 → QR_G05_CORNER_NEAR_THE_GATE_WALL
HINT_014 → QR_EMPTY_LOCKER_108
HINT_015 → QR_415_BREAK_BASEMENT_SHOP
HINT_016 → QR_WASHBASIN_NEAR_THE_MUSIC_ROOM
HINT_017 → QR_BEHIND_THE_UTKRISHTA_BANNER
HINT_018 → QR_RECHARGE_POINT_CANTEEN_AREA
HINT_019 → QR_ROOM_G06_HANGING_AC
HINT_020 → QR_STREET_LIGHTS
```

### QR Codes:

- **START** (isStartQR: true) - Teams scan this first
- 20 location QR codes (linked to hints)

---

## 🎮 GAME FLOW

```
1. Admin starts event
   ↓
2. Team scans START QR
   ↓
3. Team receives random hint (e.g., HINT_005)
   ↓
4. Team finds location and scans QR
   ↓
5a. CORRECT QR (e.g., QR_TROPHY_PLACE)
    → +100 points
    → New random hint given
   ↓
5b. WRONG QR (e.g., QR_LIBRARY)
    → -10 points penalty
    → Same hint repeated
   ↓
6. Repeat until all hints completed
```

---

## 🔧 TROUBLESHOOTING

### Issue: "Event hasn't started yet"

**Solution**: Admin must start the event

```bash
POST /api/admin/event/start
```

### Issue: "No hints available"

**Solution**: Run the script again

```bash
npm run seed:hints
# or
node scripts/addHints.js
```

### Issue: Old hints showing in admin

**Solution**: The script clears old data automatically. Refresh admin page.

### Issue: Teams can't get first hint after START scan

**Causes**:

1. Event not started by admin
2. No Hint documents in database
3. All hints already used by team

**Solution**:

- Verify event status is 'active'
- Run `npm run verify` to check data
- Reset event if needed: `npm run reset:event`

### Issue: Need to reset everything for testing

**Solution**: Run the reset script

```bash
npm run reset:event
# or
node scripts/resetEvent.js
```

This will:

- Reset event status to 'not_started'
- Clear all team progress (points, hints, scans)
- Clear scan logs
- Reset hint usage
- Keep teams registered (they can login again)

---

## 📱 API ENDPOINTS

### Game Flow:

```
POST /api/game/start        - Scan START QR, get first hint
POST /api/game/scan         - Scan location QR
GET  /api/game/logs         - View progress
GET  /api/game/current-hint - Get current active hint
```

### Admin:

```
GET  /api/admin/hints              - List all hints
POST /api/admin/hints              - Create hint
GET  /api/admin/qr-images          - Get QR codes with images
POST /api/admin/event/start        - Start event
POST /api/admin/event/end          - End event
GET  /api/admin/event/settings     - Get event status
```

---

## ✅ VERIFICATION CHECKLIST

Run this to verify everything:

```bash
npm run verify
# or
node scripts/verifySetup.js
```

Should show:

- [x] 20 Hints in database
- [x] 21 QR Codes in database (1 START + 20 locations)
- [x] START QR exists
- [x] Event Settings configured
- [ ] Event status is 'active' (Admin action required)

---

## 🔄 USEFUL SCRIPTS

### Setup Scripts:

```bash
npm run seed:hints      # Create hints and QR codes from addHints.js
npm run seed:game       # Create sample game data (from docs)
npm run verify          # Verify setup is correct
```

### Testing Scripts:

```bash
npm run reset:event     # Reset event for testing (keeps teams)
```

### What `reset:event` does:

- ✅ Resets event status to 'not_started'
- ✅ Clears all team progress (points, hints, scans)
- ✅ Clears all scan logs
- ✅ Resets hint usage (all hints available again)
- ✅ Keeps teams registered (login credentials still work)
- ✅ Keeps QR codes and hints intact

---

## 🎯 NEXT STEPS

1. ✅ Start the backend server
2. ⚠️ **Admin: Start the event via dashboard**
3. ✅ Teams can register
4. ✅ Teams scan START QR
5. ✅ Teams play treasure hunt!

---

## 📞 Support

If issues persist:

1. Check backend logs
2. Run verification: `node scripts/verifySetup.js`
3. Check admin can access `/api/admin/hints`
4. Verify event status is 'active'

---

**System Status**: ✅ Ready (Admin needs to start event)
**Last Updated**: November 5, 2025
