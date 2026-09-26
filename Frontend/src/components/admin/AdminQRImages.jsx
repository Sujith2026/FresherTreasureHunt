import React, { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";
import Badge from "../Badge";
import toast from "react-hot-toast";
import { QrCode, Download, RefreshCw, Printer } from "lucide-react";

const AdminQRImages = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getQRCodesWithImages();
      const data = response.data || response;
      setQrCodes(data.qrCodes || []);
    } catch (error) {
      toast.error("Failed to fetch QR codes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (qrId, qrCode) => {
    try {
      await adminService.downloadQRCode(qrId, qrCode);
      toast.success(`Downloaded ${qrCode}.png`);
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  const handleRegenerate = async (qrId) => {
    try {
      await adminService.regenerateQRCode(qrId);
      toast.success("QR code regenerated!");
      fetchQRCodes();
    } catch (error) {
      toast.error("Failed to regenerate QR code");
    }
  };

  const printQR = (qrCodeImage, qrCode, locationName) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${qrCode}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              font-family: Arial, sans-serif;
            }
            img { 
              width: 300px; 
              height: 300px; 
              margin: 20px 0;
            }
            h2 {
              margin: 10px 0;
              font-size: 24px;
            }
            p {
              margin: 5px 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h2>${qrCode}</h2>
          <p>${locationName || ""}</p>
          <img src="${qrCodeImage}" />
          <p style="margin-top: 20px;">Scan this code to progress in the treasure hunt</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const printAllQRCodes = () => {
    const printWindow = window.open("", "_blank");
    const qrHtml = qrCodes
      .map(
        (qr) => `
      <div class="qr-print-item">
        <h2>${qr.code}</h2>
        <p>${qr.locationName || ""}</p>
        <img src="${qr.qrCodeImage}" />
        <p class="info">Points: ${qr.points} | Scans: ${qr.scanCount}</p>
      </div>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print All QR Codes</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
            }
            .qr-print-item { 
              page-break-after: always; 
              text-align: center; 
              padding: 50px; 
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .qr-print-item:last-child {
              page-break-after: auto;
            }
            h2 {
              font-size: 32px;
              margin: 10px 0;
            }
            p {
              font-size: 18px;
              color: #666;
              margin: 10px 0;
            }
            img { 
              width: 300px; 
              height: 300px; 
              margin: 20px 0; 
            }
            .info {
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>${qrHtml}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="w-8 h-8 text-purple-600" />
          QR Code Gallery
        </h1>
        {qrCodes.length > 0 && (
          <Button onClick={printAllQRCodes}>
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : qrCodes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No QR codes found. Run the seed script to generate QR codes!</p>
            <code className="block mt-4 p-2 bg-gray-100 rounded">
              npm run seed:game
            </code>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <Card
              key={qr._id}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{qr.code}</span>
                  <div className="flex gap-2">
                    {qr.isStartQR && <Badge variant="success">START</Badge>}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        qr.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {qr.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* QR Code Image */}
                <div className="bg-white p-4 rounded-lg mb-4 flex justify-center border-2 border-gray-200">
                  {qr.qrCodeImage ? (
                    <img
                      src={qr.qrCodeImage}
                      alt={qr.code}
                      className="w-full max-w-[250px]"
                    />
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">No image available</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {qr.locationName && (
                    <p className="text-sm">
                      <span className="font-semibold">Location:</span>{" "}
                      {qr.locationName}
                    </p>
                  )}
                  {qr.linkedHintId && (
                    <p className="text-sm">
                      <span className="font-semibold">Linked Hint:</span>{" "}
                      {qr.linkedHintId}
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>
                      <span className="font-semibold">Points:</span> {qr.points}
                    </span>
                    <span>
                      <span className="font-semibold">Scans:</span>{" "}
                      {qr.scanCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Stage Index: {qr.stageIndex}
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(qr._id, qr.code)}
                    title="Download PNG"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRegenerate(qr._id)}
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      printQR(qr.qrCodeImage, qr.code, qr.locationName)
                    }
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQRImages;
