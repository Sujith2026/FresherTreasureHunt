import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// This ID is used to mount the scanner
const qrcodeRegionId = "qr-code-scanner-region";

const QrScanner = ({ onResult }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This is the scanner instance
    let html5QrCode;

    // Function to start the scanner
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          html5QrCode = new Html5Qrcode(qrcodeRegionId);
          const cameraId = devices[0].id; // Use the first camera
          
          await html5QrCode.start(
            cameraId,
            {
              fps: 10, // Frames per second
              qrbox: { width: 250, height: 250 }, // The scanning box
            },
            (decodedText, decodedResult) => {
              // Success callback
              setScanResult(decodedText);
              onResult(decodedText); // Pass result to parent
              // Stop scanner on success
              html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err));
            },
            (errorMessage) => {
              // Parse error
              // This callback is called frequently, so we don't set errors here
            }
          );
        } else {
          setError("No cameras found.");
        }
      } catch (err) {
        setError(`Failed to start scanner: ${err.message}`);
      }
    };

    startScanner();

    // Cleanup function: This runs when the component unmounts
    return () => {
      if (html5QrCode) {
        html5QrCode.stop()
          .catch((err) => console.error("Error stopping scanner on cleanup:", err));
      }
    };
  }, [onResult]);

  return (
    <div className="w-full">
      {/* This div is where the camera feed will appear */}
      <div id={qrcodeRegionId} className="w-full h-64 border-2 border-primary/30 rounded-md" />
      
      {error && <p className="text-accent-red mt-4">{error}</p>}
      
      {scanResult && (
        <div className="mt-4 text-center">
          <p className="text-text-secondary">Scan Successful:</p>
          <p className="text-primary font-mono text-lg break-all">{scanResult}</p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;