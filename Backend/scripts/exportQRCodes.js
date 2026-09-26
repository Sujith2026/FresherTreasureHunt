require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const QRStage = require('../src/models/QRStage');

const exportQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const qrCodes = await QRStage.find().sort({ stageIndex: 1 });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Treasure Hunt - All Generated QR Codes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background-color: #f3f4f6; padding: 24px; color: #1f2937; }
    header { text-align: center; margin-bottom: 28px; }
    h1 { font-size: 26px; font-weight: 700; color: #111827; }
    p.sub { font-size: 14px; color: #6b7280; margin-top: 6px; }
    .print-all-btn {
      margin-top: 14px;
      padding: 10px 20px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .print-all-btn:hover { background: #1d4ed8; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      max-width: 1300px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .card.start-card {
      border: 2px solid #10b981;
      background: #f0fdf4;
    }
    .tag {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 8px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .tag-start { background: #d1fae5; color: #065f46; }
    .tag-location { background: #e0e7ff; color: #3730a3; }
    .location-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 6px;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-img {
      width: 200px;
      height: 200px;
      margin: 12px 0;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      padding: 8px;
    }
    .code-text {
      font-family: monospace;
      font-size: 11px;
      color: #4b5563;
      word-break: break-all;
      background: #f9fafb;
      padding: 6px 10px;
      border-radius: 6px;
      width: 100%;
      margin-bottom: 8px;
    }
    .meta {
      font-size: 12px;
      color: #6b7280;
    }
    @media print {
      body { background: white; padding: 0; }
      header, .print-all-btn { display: none; }
      .grid { display: block; }
      .card {
        page-break-inside: avoid;
        margin-bottom: 24px;
        border: 1px dashed #9ca3af;
        box-shadow: none;
      }
      .qr-img { width: 220px; height: 220px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>🎯 Treasure Hunt - Generated QR Codes (${qrCodes.length})</h1>
    <p class="sub">All QR codes generated from <code>addHints.js</code> with scannable images</p>
    <button class="print-all-btn" onclick="window.print()">🖨️ Print All QR Codes</button>
  </header>

  <div class="grid">
    ${qrCodes.map((qr) => `
      <div class="card ${qr.isStartQR ? 'start-card' : ''}">
        <div>
          <span class="tag ${qr.isStartQR ? 'tag-start' : 'tag-location'}">
            ${qr.isStartQR ? '🎯 START POINT' : `📍 STAGE ${qr.stageIndex}`}
          </span>
          <div class="location-title">${qr.locationName}</div>
        </div>
        <img class="qr-img" src="${qr.qrCodeImage}" alt="${qr.code}" />
        <div class="code-text">${qr.code}</div>
        <div class="meta">
          ${qr.isStartQR ? 'Scan to begin hunt' : `Points: <strong>${qr.points}</strong> | Hint: <strong>${qr.linkedHintId || 'None'}</strong>`}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    const outputPath = path.join(__dirname, '../generated-qr-codes.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    console.log(`✅ Exported ${qrCodes.length} QR codes to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting QR codes:', error);
    process.exit(1);
  }
};

exportQRCodes();
