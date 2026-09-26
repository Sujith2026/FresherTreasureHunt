# Scripts Documentation

This folder contains utility scripts for managing the treasure hunt system.

## 📋 Available Scripts

### 1. `addHints.js` - Create Hints and QR Codes

Creates hints and QR codes from your custom data.

**Usage:**

```bash
npm run seed:hints
# or
node scripts/addHints.js
```

**What it does:**

- Clears existing hints and QR codes
- Creates START QR code
- Creates Hint documents for each location
- Creates QR codes linked to hints
- Generates scannable QR code images

**Edit this file** to add/modify your hints in the `hints` array.

---

### 2. `initEvent.js` - Initialize Event

Sets the event to active status (only needs to be run once).

**Usage:**

```bash
npm run init:event
# or
node scripts/initEvent.js
```

**What it does:**

- Creates event settings if not exist
- Sets event status to 'active'
- Allows teams to start playing immediately

**Use when:** First time setup or after database reset.

---

### 3. `resetEvent.js` - Reset Event for Testing

Resets the event while keeping teams and QR codes.

**Usage:**

```bash
npm run reset:event
# or
node scripts/resetEvent.js
```

**What it does:**

- Resets event status to 'not_started'
- Clears all team progress (points, hints, scans to 0)
- Clears all scan logs
- Resets hint usage (makes all hints available again)
- Keeps teams registered (login still works)
- Keeps QR codes and hints intact

**Use when:** You want to start a fresh game without recreating teams or QR codes.

---

### 4. `verifySetup.js` - Verify System Setup

Checks if everything is configured correctly.

**Usage:**

```bash
npm run verify
# or
node scripts/verifySetup.js
```

**What it shows:**

- Number of Hints in database
- Number of QR Codes in database
- START QR existence
- Event status
- What action is needed (if any)

---

### 5. `startEvent.js` - Quick Event Starter

Starts the event directly without using the admin dashboard.

**Usage:**

```bash
npm run start:event
# or
node scripts/startEvent.js
```

**What it does:**

- Changes event status from 'not_started' to 'active'
- Allows teams to start scanning QR codes
- Shows current event status

**Use when:** Quick testing without logging into admin dashboard.

---

### 6. `debugEvent.js` - Comprehensive Diagnostics

Runs complete system diagnostics to troubleshoot scanning issues.

**Usage:**

```bash
npm run debug:event
# or
node scripts/debugEvent.js
```

**What it shows:**

- Event status and timing
- All Hints with active/inactive status
- All QR codes with locations
- START QR existence and location
- Sample team status and progress
- System diagnosis with recommendations

**Use when:** Teams can't scan QR codes or system isn't working as expected.

---

### 7. `seedGameData.js` - Sample Data (from docs)

Creates sample hints and QR codes as per documentation.

**Usage:**

```bash
npm run seed:game
# or
node scripts/seedGameData.js
```

**What it does:**

- Creates 5 sample hints (Library, Lab, Cafe, etc.)
- Creates corresponding QR codes
- Creates START QR

**Note:** This is from the original documentation. Use `addHints.js` for your custom hints.

---

### 8. `seed.js` - Old Seed Script (deprecated)

Legacy seed script for backward compatibility.

**Usage:**

```bash
npm run seed
# or
node scripts/seed.js
```

---

### 9. `testQRCodes.js` - Test QR Code Storage

Verifies QR codes are stored correctly with images.

**Usage:**

```bash
node scripts/testQRCodes.js
```

**What it shows:**

- All QR codes with their locations
- Image generation status
- Image sizes

---

## 🚀 Recommended Workflow

### Initial Setup:

1. Edit `addHints.js` with your hints
2. Run `npm run seed:hints` to create data
3. Run `npm run init:event` to set event active
4. Run `npm run verify` to check setup
5. Start backend: `npm run dev`
6. Teams can login and scan START QR anytime

### Testing/Development:

1. Run `npm run reset:event` when you need a fresh start
2. Teams can immediately start playing (no admin action needed)
3. Test with teams

### Production:

1. Run `npm run seed:hints` once
2. Run `npm run init:event` once
3. Start backend
4. Teams can play anytime
5. Admin can end event when needed

---

## 📊 Quick Reference

| Script           | Command               | When to Use                        |
| ---------------- | --------------------- | ---------------------------------- |
| Create Hints     | `npm run seed:hints`  | First time setup or hint changes   |
| Initialize Event | `npm run init:event`  | Set event active (first time only) |
| Reset Event      | `npm run reset:event` | Between test runs                  |
| Start Event      | `npm run start:event` | (Optional) Set to active if needed |
| Debug System     | `npm run debug:event` | Troubleshoot scanning issues       |
| Verify Setup     | `npm run verify`      | Check system status                |
| Sample Data      | `npm run seed:game`   | Try sample game flow               |

---

## ⚠️ Important Notes

- **Always backup data** before running scripts that clear data
- `addHints.js` and `seedGameData.js` will **delete existing hints/QR codes**
- `resetEvent.js` will **clear team progress** but keeps teams registered
- Run `verifySetup.js` after any changes to confirm system state

---

## 🔧 Customization

### Adding New Hints:

Edit `addHints.js`:

```javascript
const hints = [
  {
    location: "Your Location Name",
    hint: "Your riddle/hint text",
  },
  // Add more...
];
```

Then run: `npm run seed:hints`

---

## 📞 Support

If scripts fail:

1. Check MongoDB connection (`.env` file)
2. Ensure backend dependencies installed: `npm install`
3. Check for error messages in console
4. Verify MongoDB is running
