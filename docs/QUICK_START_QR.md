# 🎯 Quick Start - QR Code Admin Dashboard

## ⚡ 3-Step Setup

### 1️⃣ Generate QR Codes

```bash
npm run seed:game
```

✅ Creates 6 QR codes with scannable images

### 2️⃣ Start Server

```bash
npm run dev
```

✅ Server running on http://localhost:5000

### 3️⃣ Test Endpoints

```bash
# Get all QR codes
curl http://localhost:5000/api/admin/qr-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Download a QR code
curl http://localhost:5000/api/admin/qr/QR_ID/download \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o library.png
```

---

## 📱 API Quick Reference

| Endpoint                       | Method | Purpose                        |
| ------------------------------ | ------ | ------------------------------ |
| `/api/admin/qr-images`         | GET    | Get all QR codes with images   |
| `/api/admin/qr/:id/download`   | GET    | Download QR as PNG file        |
| `/api/admin/qr/:id/regenerate` | POST   | Regenerate QR image            |
| `/api/admin/qr`                | POST   | Create new QR (auto-generates) |

---

## 🎨 Frontend - Display QR Codes

```jsx
// Fetch and display
const [qrCodes, setQrCodes] = useState([]);

useEffect(() => {
  fetch("/api/admin/qr-images", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => setQrCodes(data.data.qrCodes));
}, []);

return (
  <div>
    {qrCodes.map((qr) => (
      <div key={qr._id}>
        <h3>{qr.code}</h3>
        <img src={qr.qrCodeImage} alt={qr.code} />
        <p>{qr.locationName}</p>
      </div>
    ))}
  </div>
);
```

---

## 🖨️ Print QR Code

```javascript
const printQR = (qrImage) => {
  const win = window.open("");
  win.document.write(`
    <img src="${qrImage}" style="width: 300px" />
  `);
  win.print();
};
```

---

## 📥 Download QR Code

```javascript
const downloadQR = (qrId, qrCode) => {
  fetch(`/api/admin/qr/${qrId}/download`)
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${qrCode}.png`;
      a.click();
    });
};
```

---

## 📊 What You Get

After running `npm run seed:game`:

```
✅ START - Start Point QR
✅ QR_LIBRARY - Library Entrance
✅ QR_LAB - Science Lab
✅ QR_CAFE - Cafeteria
✅ QR_AUDITORIUM - Main Auditorium
✅ QR_GARDEN - Campus Garden
```

Each with:

- ✅ 300x300 PNG image
- ✅ Base64 data URL
- ✅ Scannable with any QR reader
- ✅ Print-ready quality

---

## 🔍 Verify QR Codes

```bash
node scripts/testQRCodes.js
```

Output:

```
📱 Found 6 QR codes:

🎯 START
   QR Image: ✅ Generated (2.03 KB)

📍 QR_LIBRARY
   QR Image: ✅ Generated (2.39 KB)
...
```

---

## 📚 Documentation Files

1. **QR_IMPLEMENTATION_SUMMARY.md** - Complete implementation details
2. **QR_CODE_ADMIN_GUIDE.md** - Full API documentation
3. **qr-preview.html** - Visual preview page
4. **This file** - Quick reference

---

## 🚀 You're All Set!

Your QR codes are ready to:

- Display in admin dashboard ✅
- Download as PNG files ✅
- Print for physical placement ✅
- Scan with mobile devices ✅

**Next:** Build the frontend admin component to display these QR codes! 🎨
