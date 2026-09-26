# 🎯 Real Treasure Hunt - Complete Setup

## ✅ System Status: READY

### 📊 Current Configuration

**Total Hints:** 20 real campus locations  
**Total QR Codes:** 21 (1 START + 20 location QRs)  
**Points per correct scan:** 100  
**Wrong scan penalty:** 20 points

---

## 📍 All 20 Hunt Locations

| #   | Hint ID  | QR Code             | Location                                  |
| --- | -------- | ------------------- | ----------------------------------------- |
| 1   | HINT_001 | QR_DIRECTORS_DEN    | 2nd Floor, in front of the Director's Den |
| 2   | HINT_002 | QR_CLAB_ECE         | Near C-Lab & ECE Lab-2                    |
| 3   | HINT_003 | QR_ACAD_STAIRS      | Stairs before the Acad Office Door        |
| 4   | HINT_004 | QR_TT_TABLE         | Basement by the TT Table                  |
| 5   | HINT_005 | QR_TROPHY           | Trophy Place                              |
| 6   | HINT_006 | QR_PACKAGE_AREA     | Where Packages Rest                       |
| 7   | HINT_007 | QR_GYM              | Gym                                       |
| 8   | HINT_008 | QR_CONSTRUCTION     | Construction Site                         |
| 9   | HINT_009 | QR_ILOVE_IIIT       | I Love IIIT Spot                          |
| 10  | HINT_010 | QR_MEMS_PILLAR      | Pillar Opposite MEMS Lab (1st Floor)      |
| 11  | HINT_011 | QR_DRY_TREE         | Tree with No Leaves                       |
| 12  | HINT_012 | QR_LIBRARY          | Library                                   |
| 13  | HINT_013 | QR_G05_CORNER       | G05 Corner, Near the Gate Wall            |
| 14  | HINT_014 | QR_LOCKER_108       | Empty Locker 108                          |
| 15  | HINT_015 | QR_BASEMENT_SHOP    | 4:15 Break — Basement Shop                |
| 16  | HINT_016 | QR_MUSIC_WASHBASIN  | Washbasin near the Music Room             |
| 17  | HINT_017 | QR_UTKRISHTA_BANNER | Behind the Utkrishta Banner               |
| 18  | HINT_018 | QR_RECHARGE_POINT   | Recharge Point (Canteen Area)             |
| 19  | HINT_019 | QR_G06_AC           | Room G06 - Hanging AC                     |
| 20  | HINT_020 | QR_STREET_LIGHTS    | Street Lights                             |

---

## 🎮 How It Works

### For Teams:

1. **Login** → Navigate to Treasure Hunt page
2. **Scan START QR** → Get a random hint from the 20 locations
3. **Read the hint** → Figure out which campus location it refers to
4. **Find the location** → Go to the physical spot on campus
5. **Scan the QR code** → Placed at that location
6. **Correct scan** → Get +100 points and next random hint
7. **Wrong scan** → Lose 20 points, keep current hint
8. **Repeat** → Continue until all 20 hints completed!

### Example Flow:

```
Scan START → Get "He rules the land, again and again..."
→ Realize it's Director's Den
→ Go to 2nd Floor, Director's Den
→ Scan QR_DIRECTORS_DEN
→ ✅ +100 points!
→ Get next random hint → Repeat
```

---

## 🛠️ Admin Commands

### Seed Database:

```bash
npm run seed:real      # Seed 20 real hints + QR codes
npm run fix:teams      # Reset teams with invalid hints
npm run debug:event    # Check system status
npm run init:event     # Initialize/start event
```

### Print QR Codes:

1. Login to admin panel
2. Go to "QR Gallery"
3. Click "Print All" or individual download buttons
4. Print and place QR codes at each location

---

## 📱 QR Code Placement Guide

**Print Settings:**

- Size: A4 or Letter
- Quality: High (300 DPI)
- Include location name below QR for verification

**Placement Tips:**

- Eye level, easy to scan
- Protected from weather (if outdoor)
- Well-lit area
- Secure (tape/laminate)
- Hidden but discoverable

**START QR:**

- Place at main event entrance
- Multiple copies if needed
- Clearly labeled "START HERE"

---

## ✅ System Verified

- ✅ 20 hints loaded
- ✅ 21 QR codes generated
- ✅ All hint → QR mappings correct
- ✅ Teams reset and ready
- ✅ Event is ACTIVE
- ✅ Frontend displays hints properly
- ✅ Wrong scan penalty: 20 points
- ✅ Correct scan reward: 100 points

---

## 🎉 Ready to Play!

The system is now fully configured with your real 20-location treasure hunt. Teams can start playing immediately!

**Next Steps:**

1. Print all QR codes from admin panel
2. Place QR codes at the 20 locations
3. Teams login and scan START
4. Let the hunt begin! 🏆
