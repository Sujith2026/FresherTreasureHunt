# 🎯 Quick API Reference - Treasure Hunt System

## Base URL

```
http://localhost:5000/api
```

---

## 🔐 Authentication

All game and team endpoints require JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🎮 Game Endpoints

### 1. Start Game

**Start the treasure hunt by scanning the START QR**

```http
POST /game/start

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "qrId": "START"
}

Success Response (200):
{
  "success": true,
  "message": "Game started! Follow the hint...",
  "hint": {
    "id": "HINT_001",
    "text": "Find where books meet technology...",
    "type": "text"
  },
  "team": {
    "points": 0,
    "currentHintId": "HINT_001",
    "hintsCollected": 1
  }
}

Error Response (400):
{
  "success": false,
  "message": "Game already started. Follow your current hint.",
  "currentHint": { ... }
}
```

---

### 2. Scan QR Code

**Scan a QR code during the game**

```http
POST /game/scan

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "qrId": "QR_LIBRARY"
}

Success Response - CORRECT QR (200):
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
    "text": "Ascend to the third floor...",
    "type": "text"
  },
  "gameCompleted": false
}

Error Response - WRONG QR (200):
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
    "text": "Find where books meet technology...",
    "type": "text"
  }
}

Game Completed Response (200):
{
  "success": true,
  "status": "correct",
  "pointsAwarded": 20,
  "gameCompleted": true,
  "completionMessage": "Congratulations! You have completed the treasure hunt!",
  "nextHint": null
}
```

---

### 3. Get Hint Logs

**View complete hint history and progress**

```http
GET /game/logs

Headers:
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "data": {
    "team": {
      "id": "6472abc123...",
      "name": "Team Alpha",
      "points": 45
    },
    "currentHint": {
      "id": "HINT_003",
      "text": "Where students gather to refuel...",
      "receivedAt": "2025-11-05T10:15:00.000Z"
    },
    "progress": {
      "hintsCompleted": 2,
      "totalHints": 3,
      "wrongScans": 1,
      "qrsScanned": 4
    },
    "hintLog": [
      {
        "hintId": "HINT_001",
        "hintText": "Find where books meet...",
        "status": "completed",
        "qrScanned": "QR_LIBRARY",
        "pointsEarned": 15,
        "timestamp": "2025-11-05T10:05:00.000Z"
      },
      {
        "hintId": "HINT_002",
        "hintText": "Ascend to third floor...",
        "status": "completed",
        "qrScanned": "QR_LAB",
        "pointsEarned": 20,
        "timestamp": "2025-11-05T10:12:00.000Z"
      },
      {
        "hintId": "HINT_002",
        "hintText": "Ascend to third floor...",
        "status": "wrong",
        "qrScanned": "QR_CAFE",
  "pointsEarned": -20,
        "timestamp": "2025-11-05T10:10:00.000Z"
      },
      {
        "hintId": "HINT_003",
        "hintText": "Where students gather...",
        "status": "active",
        "qrScanned": null,
        "pointsEarned": 0,
        "timestamp": "2025-11-05T10:15:00.000Z"
      }
    ]
  }
}
```

---

### 4. Get Current Hint

**Get the active hint the team should follow**

```http
GET /game/current-hint

Headers:
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "currentHint": {
    "id": "HINT_002",
    "text": "Ascend to the third floor where science comes alive.",
    "type": "text"
  }
}

No Active Hint (200):
{
  "success": true,
  "message": "No active hint. Game not started or completed.",
  "currentHint": null
}
```

---

## 👑 Admin Endpoints

### Hint Management

#### Get All Hints

```http
GET /admin/hints

Headers:
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "count": 5,
  "data": {
    "hints": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "hintId": "HINT_001",
        "text": "Find where books meet technology...",
        "qrId": "QR_LIBRARY",
        "points": 15,
        "usedByTeams": ["team1", "team2"],
        "hintType": "text",
        "difficulty": "easy",
        "active": true,
        "createdAt": "2025-11-05T09:00:00.000Z"
      },
      // ... more hints
    ]
  }
}
```

#### Create Hint

```http
POST /admin/hints

Headers:
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "hintId": "HINT_006",
  "text": "Find the rooftop garden where the sun meets the sky.",
  "qrId": "QR_ROOF",
  "points": 25,
  "hintType": "text",
  "difficulty": "hard"
}

Success Response (201):
{
  "success": true,
  "message": "Hint created successfully",
  "data": {
    "hint": { ... }
  }
}

Error Response (400):
{
  "success": false,
  "message": "Missing required fields (hintId, text, qrId)"
}
```

#### Update Hint

```http
PATCH /admin/hints/:id

Headers:
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "text": "Updated hint text...",
  "points": 30,
  "active": true
}

Success Response (200):
{
  "success": true,
  "message": "Hint updated successfully",
  "data": {
    "hint": { ... }
  }
}
```

#### Delete Hint

```http
DELETE /admin/hints/:id

Headers:
Authorization: Bearer <admin_token>

Success Response (200):
{
  "success": true,
  "message": "Hint deleted successfully"
}
```

#### Get Single Hint

```http
GET /admin/hints/:id

Headers:
Authorization: Bearer <admin_token>

Success Response (200):
{
  "success": true,
  "data": {
    "hint": { ... }
  }
}
```

---

## 📊 Existing Endpoints (Still Active)

### Leaderboard

```http
GET /leaderboard

No auth required

Response (200):
{
  "success": true,
  "count": 10,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "teamId": "...",
        "teamName": "Team Alpha",
        "points": 85,
        "memberCount": 3,
        "lastScanAt": "2025-11-05T10:30:00.000Z"
      },
      // ... more teams
    ]
  }
}
```

### Team Profile

```http
GET /team

Headers:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "team": {
      "id": "...",
      "teamName": "Team Alpha",
      "points": 85,
      "members": [...],
      "currentHintId": "HINT_004",
      "hintLog": [...],
      "scannedQRs": ["START", "QR_LIBRARY", ...],
      "wrongScans": 2
    }
  }
}
```

---

## 🔢 Status Codes

| Code | Meaning                                    |
| ---- | ------------------------------------------ |
| 200  | Success                                    |
| 201  | Created                                    |
| 400  | Bad Request (missing fields, invalid data) |
| 401  | Unauthorized (invalid/missing token)       |
| 403  | Forbidden (not admin)                      |
| 404  | Not Found                                  |
| 409  | Conflict (duplicate)                       |
| 429  | Too Many Requests (rate limited)           |
| 500  | Server Error                               |

---

## 📝 Request Examples (curl)

### Start Game

```bash
curl -X POST http://localhost:5000/api/game/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrId": "START"}'
```

### Scan QR

```bash
curl -X POST http://localhost:5000/api/game/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrId": "QR_LIBRARY"}'
```

### Get Logs

```bash
curl -X GET http://localhost:5000/api/game/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Hint (Admin)

```bash
curl -X POST http://localhost:5000/api/admin/hints \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hintId": "HINT_006",
    "text": "Find the secret passage...",
    "qrId": "QR_SECRET",
    "points": 50
  }'
```

---

## 🎯 Testing with Postman

1. **Import Collection:** Copy endpoints above
2. **Set Environment:**
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token
   - `admin_token`: Admin JWT token
3. **Test Flow:**
   - POST `/auth/login` → Get token
   - POST `/game/start` → Start hunt
   - POST `/game/scan` → Scan QRs
   - GET `/game/logs` → View progress

---

## 🚀 WebSocket Events (Future)

Coming soon for real-time updates:

```javascript
socket.on("hint:received", (data) => {
  // New hint received
});

socket.on("qr:scanned", (data) => {
  // QR scan result
});

socket.on("leaderboard:updated", () => {
  // Leaderboard changed
});
```

---

**📘 For full documentation, see:** `GAME_FLOW.md`  
**🔄 For migration guide, see:** `MIGRATION_GUIDE.md`
