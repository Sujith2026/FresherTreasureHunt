# 📱 QR Code Admin Dashboard Guide

## ✅ Implementation Complete

The admin dashboard now has full QR code generation and management capabilities. Each QR code is automatically generated as a scannable image that can be displayed, downloaded, and printed.

---

## 🎯 Features

### 1. **Automatic QR Code Generation**

- QR codes are automatically generated when:
  - Running the seed script (`npm run seed:game`)
  - Creating a new QR stage via admin API
- Generated as base64 PNG images (300x300px)
- High error correction level (H) for better scanning
- Stored directly in the database

### 2. **View QR Codes in Admin Dashboard**

- Display all QR codes with their images
- Show QR code metadata (location, points, status)
- Real-time scan count tracking

### 3. **Download QR Codes**

- Download individual QR codes as PNG files
- Print-ready format
- Named with QR code identifier

### 4. **Regenerate QR Codes**

- Re-generate QR code images if needed
- Useful after QR code text changes

---

## 🔌 API Endpoints

### **GET /api/admin/qr-images**

Get all QR codes with their scannable images

**Request:**

```bash
GET /api/admin/qr-images
Authorization: Bearer ADMIN_TOKEN
```

**Response:**

```json
{
  "success": true,
  "count": 6,
  "data": {
    "qrCodes": [
      {
        "_id": "60d5f8e9d8f8e5001f8d8e9d",
        "code": "START",
        "locationName": "Start Point - Main Entrance",
        "isStartQR": true,
        "linkedHintId": null,
        "points": 0,
        "active": true,
        "scanCount": 0,
        "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "stageIndex": 0,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "60d5f8e9d8f8e5001f8d8e9e",
        "code": "QR_LIBRARY",
        "locationName": "Library Entrance",
        "isStartQR": false,
        "linkedHintId": "HINT_001",
        "points": 100,
        "active": true,
        "scanCount": 5,
        "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "stageIndex": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
      // ... more QR codes
    ]
  }
}
```

---

### **GET /api/admin/qr/:id/download**

Download a specific QR code as PNG

**Request:**

```bash
GET /api/admin/qr/60d5f8e9d8f8e5001f8d8e9e/download
Authorization: Bearer ADMIN_TOKEN
```

**Response:**

- Content-Type: `image/png`
- Content-Disposition: `attachment; filename="QR_LIBRARY.png"`
- Binary PNG image data

**Usage Example:**

```javascript
// In your admin frontend
const downloadQR = async (qrId, qrCode) => {
  const response = await fetch(`/api/admin/qr/${qrId}/download`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${qrCode}.png`;
  a.click();
};
```

---

### **POST /api/admin/qr/:id/regenerate**

Regenerate QR code image for a specific QR stage

**Request:**

```bash
POST /api/admin/qr/60d5f8e9d8f8e5001f8d8e9e/regenerate
Authorization: Bearer ADMIN_TOKEN
```

**Response:**

```json
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "qrStage": {
      "_id": "60d5f8e9d8f8e5001f8d8e9e",
      "code": "QR_LIBRARY",
      "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS..."
      // ... other fields
    }
  }
}
```

---

### **POST /api/admin/qr**

Create a new QR stage (automatically generates QR code image)

**Request:**

```bash
POST /api/admin/qr
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "code": "QR_CUSTOM_LOCATION",
  "stageIndex": 7,
  "locationName": "Custom Location Name",
  "linkedHintId": "HINT_006",
  "points": 100,
  "active": true,
  "isStartQR": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "QR stage created successfully with scannable QR code",
  "data": {
    "stage": {
      "_id": "60d5f8e9d8f8e5001f8d8e9f",
      "code": "QR_CUSTOM_LOCATION",
      "locationName": "Custom Location Name",
      "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS..."
      // ... other fields
    }
  }
}
```

---

## 🎨 Frontend Integration

### **Display QR Codes in Admin Dashboard**

```jsx
import React, { useState, useEffect } from "react";
import { getQRCodesWithImages, downloadQRCode } from "../services/adminService";

const AdminQRDashboard = () => {
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    const fetchQRCodes = async () => {
      const response = await getQRCodesWithImages();
      setQrCodes(response.data.qrCodes);
    };
    fetchQRCodes();
  }, []);

  return (
    <div className="qr-dashboard">
      <h1>QR Code Management</h1>
      <div className="qr-grid">
        {qrCodes.map((qr) => (
          <div key={qr._id} className="qr-card">
            <div className="qr-header">
              <h3>{qr.code}</h3>
              {qr.isStartQR && <span className="badge">START</span>}
            </div>

            {/* Display QR Code Image */}
            <img src={qr.qrCodeImage} alt={qr.code} className="qr-image" />

            <div className="qr-info">
              <p>
                <strong>Location:</strong> {qr.locationName}
              </p>
              <p>
                <strong>Points:</strong> {qr.points}
              </p>
              <p>
                <strong>Scans:</strong> {qr.scanCount}
              </p>
              <p>
                <strong>Status:</strong> {qr.active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="qr-actions">
              <button onClick={() => downloadQRCode(qr._id, qr.code)}>
                📥 Download
              </button>
              <button onClick={() => printQR(qr.qrCodeImage)}>🖨️ Print</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQRDashboard;
```

---

### **adminService.js**

```javascript
import api from "../config/api";

export const getQRCodesWithImages = async () => {
  const response = await api.get("/admin/qr-images");
  return response.data;
};

export const downloadQRCode = async (qrId, qrCode) => {
  const response = await fetch(`${API_BASE_URL}/admin/qr/${qrId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${qrCode}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const regenerateQRCode = async (qrId) => {
  const response = await api.post(`/admin/qr/${qrId}/regenerate`);
  return response.data;
};
```

---

## 🖨️ Printing QR Codes

### **Option 1: Direct Print**

```javascript
const printQR = (qrCodeImage) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print QR Code</title>
        <style>
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
          }
          img { 
            width: 300px; 
            height: 300px; 
          }
        </style>
      </head>
      <body>
        <img src="${qrCodeImage}" />
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
```

### **Option 2: Print Multiple QR Codes**

```javascript
const printAllQRCodes = (qrCodes) => {
  const printWindow = window.open("", "_blank");
  const qrHtml = qrCodes
    .map(
      (qr) => `
    <div class="qr-print-item">
      <h2>${qr.code}</h2>
      <p>${qr.locationName}</p>
      <img src="${qr.qrCodeImage}" />
      <p>Points: ${qr.points}</p>
    </div>
  `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print All QR Codes</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .qr-print-item { 
            page-break-after: always; 
            text-align: center; 
            padding: 50px; 
          }
          img { 
            width: 300px; 
            height: 300px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>${qrHtml}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
```

---

## 📊 Database Schema

The `QRStage` model now includes:

```javascript
{
  code: String,              // "QR_LIBRARY"
  isStartQR: Boolean,        // true for START QR
  linkedHintId: String,      // "HINT_001"
  locationName: String,      // "Library Entrance"
  qrCodeImage: String,       // "data:image/png;base64,..."
  points: Number,            // 100
  active: Boolean,           // true
  scanCount: Number,         // 0
  stageIndex: Number,        // 1
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Quick Start

### **1. Seed Database with QR Codes**

```bash
npm run seed:game
```

### **2. Test API Endpoints**

```bash
# Get all QR codes with images
curl -X GET http://localhost:5000/api/admin/qr-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Download a specific QR code
curl -X GET http://localhost:5000/api/admin/qr/QR_ID/download \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output qr_library.png
```

### **3. Display in Frontend**

```jsx
// Simply render the base64 image
<img src={qr.qrCodeImage} alt={qr.code} />
```

---

## 🎯 Sample QR Codes Generated

After running `npm run seed:game`, you'll have:

1. **START** - Start Point QR
2. **QR_LIBRARY** - Library Entrance
3. **QR_LAB** - Science Lab (3rd Floor)
4. **QR_CAFE** - Cafeteria
5. **QR_AUDITORIUM** - Main Auditorium
6. **QR_GARDEN** - Campus Garden

Each with a scannable QR code image stored in the database!

---

## 🔧 Customization

### **Change QR Code Appearance**

Edit the QR code generation options in `adminController.js`:

```javascript
const qrCodeImage = await QRCode.toDataURL(code, {
  errorCorrectionLevel: "H", // L, M, Q, H
  type: "image/png",
  width: 300, // Change size
  margin: 2, // Border margin
  color: {
    dark: "#000000", // QR code color
    light: "#FFFFFF", // Background color
  },
});
```

### **Add Logo to QR Code**

For advanced customization, you can overlay a logo:

```javascript
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");

const generateQRWithLogo = async (data, logoPath) => {
  // Generate QR code to canvas
  const canvas = createCanvas(300, 300);
  await QRCode.toCanvas(canvas, data, { width: 300 });

  // Load and draw logo
  const ctx = canvas.getContext("2d");
  const logo = await loadImage(logoPath);
  const logoSize = 60;
  const logoX = (300 - logoSize) / 2;
  const logoY = (300 - logoSize) / 2;

  ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

  return canvas.toDataURL();
};
```

---

## ✅ Testing Checklist

- [ ] Run seed script and verify QR codes are generated
- [ ] View QR codes in admin dashboard
- [ ] Download a QR code as PNG
- [ ] Print a QR code
- [ ] Scan QR code with mobile device
- [ ] Create new QR stage via API
- [ ] Regenerate QR code image
- [ ] Verify QR code works in game flow

---

## 🎉 Ready to Use!

Your admin dashboard now has full QR code management:

- ✅ Automatic generation
- ✅ Display in dashboard
- ✅ Download as PNG
- ✅ Print functionality
- ✅ Regeneration support

Teams can now scan these QR codes to play the treasure hunt! 🎮
