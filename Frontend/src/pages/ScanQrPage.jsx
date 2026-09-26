import React, { useState, useEffect, useRef } from "react";
import leaderboardService from "../services/leaderboardService";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../context/AuthContext";
import scanService from "../services/scanService";
import teamService from "../services/teamService";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import Badge from "../components/Badge";
import { Alert, AlertDescription } from "../components/Alert";
import Button from "../components/Button";
import toast from "react-hot-toast";
import {
  QrCode,
  Camera,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Info,
} from "lucide-react";

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

function ScanQrPage() {
  const { team, updateTeam } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hintData, setHintData] = useState(null); // Store hint after scan
  const [rank, setRank] = useState(null);

  // Use refs for scanner instance and scan lock
  const scannerRef = useRef(null);
  const scanLock = useRef(true);
  const lastScannedQR = useRef(null);

  useEffect(() => {
    loadTeamData();
    fetchRank();
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // ignore
        }
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  // Fetch leaderboard and determine current team's rank
  const fetchRank = async () => {
    try {
      const response = await leaderboardService.getLeaderboard();
      const leaderboard =
        response.data?.leaderboard || response.leaderboard || [];
      if (team && leaderboard.length > 0) {
        const found = leaderboard.find(
          (t) => t.teamId === team.id || t.teamName === team.teamName
        );
        setRank(found ? found.rank || leaderboard.indexOf(found) + 1 : null);
      } else {
        setRank(null);
      }
    } catch (err) {
      setRank(null);
    }
  };

  const loadTeamData = async () => {
    try {
      const profileData = await teamService.getProfile();
      updateTeam(profileData.team || profileData.data?.team);
      setScanHistory([]); // No scan history for now
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const startScanning = () => {
    setScanning(true);
    scanLock.current = true; // Lock to prevent old callbacks

    // Always clear any previous scanner instance
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }

    // Ensure qr-reader div exists
    setTimeout(() => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );
        scannerRef.current = html5QrcodeScanner;
        html5QrcodeScanner.render(onScanSuccess, (err) => {
          if (err && err.name === "NotAllowedError") {
            toast.error(
              "Camera access denied. Please allow camera permissions."
            );
            setScanning(false);
          }
        });
        // Unlock AFTER scanner is fully initialized and ready
        scanLock.current = false;
      } catch (err) {
        toast.error("Failed to start camera: " + (err.message || err));
        setScanning(false);
      }
    }, 100); // slight delay to ensure DOM is ready
  };

  const stopScanning = () => {
    scanLock.current = true; // Lock before cleanup
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Prevent repeated scan handler calls and duplicate scans
  const onScanSuccess = async (decodedText) => {
    if (scanLock.current) return;
    scanLock.current = true;
    try {
      // Sanitize and log scanned value
      const qrValue = (decodedText || "").trim().toUpperCase();
      console.log("Scanned QR value:", qrValue);

      // Prevent duplicate scans of the same QR within 1 second
      if (lastScannedQR.current === qrValue) {
        console.warn("Duplicate QR detected within 1 second, ignoring");
        return;
      }
      lastScannedQR.current = qrValue;

      // Stop scanning temporarily and cleanup
      stopScanning();

      if (!qrValue) {
        toast.error("Scanned QR code is empty or invalid.");
        return;
      }

      // Send scan to backend
      const response = await scanService.scanQR(qrValue);
      const respData = response?.data || response;

      // Check for event status messages
      if (respData.eventStatus === "not_started") {
        toast.error(
          "The event hasn't started yet. Please wait for the admin to begin.",
          {
            duration: 5000,
            icon: "⏸️",
          }
        );
        return;
      }

      if (respData.eventStatus === "ended") {
        toast.error("The event has ended. No further scans are allowed.", {
          duration: 5000,
          icon: "⏹️",
        });
        return;
      }

      // Check for elimination status
      if (respData.eliminated) {
        toast.error(
          "You have been eliminated from the event. Scan a rejoin QR to continue.",
          {
            duration: 7000,
            icon: "❌",
          }
        );
        return;
      }

      // Prepare scan entry for history
      const scanEntry = {
        qrCode: qrValue,
        success: !!respData.success,
        message:
          respData.message ||
          respData.error ||
          (respData.success ? "Successful scan" : "Failed scan"),
        pointsAwarded: respData.pointsAwarded || 0,
        pointsDeducted: respData.pointsDeducted || 0,
        scanPosition: respData.scanPosition || null, // Track scan position
        stage: respData.currentStage || respData.stageIndex || null,
        hint:
          respData.hintType && respData.hintValue
            ? { type: respData.hintType, value: respData.hintValue }
            : null,
        timestamp: Date.now(),
      };

      // Store hint data if present (for popup)
      if (respData.success && respData.hintType && respData.hintValue) {
        setHintData({
          type: respData.hintType,
          value: respData.hintValue,
          points: respData.pointsAwarded || 0,
          scanPosition: respData.scanPosition || null,
        });
      }

      // Add to scan history (most recent first)
      setScanHistory((prev) => [scanEntry, ...prev]);

      if (respData.success) {
        // Show position-based success message
        const positionSuffix = respData.scanPosition
          ? ` (${getOrdinalSuffix(respData.scanPosition)} to scan)`
          : "";
        const successMessage = `${respData.message}${positionSuffix}`;
        toast.success(successMessage, { duration: 5000, icon: "🎯" });
        // Update team data if backend returns it, otherwise fetch
        if (respData.team) {
          updateTeam(respData.team);
        } else {
          await loadTeamData();
        }
        // Refresh rank after scan
        fetchRank();
      } else {
        toast.error(
          respData.message ||
            respData.error ||
            JSON.stringify(respData) ||
            "Scan rejected"
        );
        // Always fetch fresh team data after wrong scan to ensure UI updates
        if (respData.team) {
          updateTeam(respData.team);
        } else {
          await loadTeamData();
        }
        // Refresh rank after scan
        fetchRank();
      }
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.message ||
        error?.response?.data?.message ||
        JSON.stringify(error) ||
        "Scan failed. Please try again.";
      toast.error(message);
    } finally {
      // Always unlock for next scan attempt
      scanLock.current = false;
    }
  };

  const onScanFailure = (error) => {
    // Ignore scan failures (continuous scanning)
  };

  return (
    <div className="min-h-screen py-6 md:py-8 px-3 md:px-4 bg-linear-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Welcome/Quick Start Section - Mobile Optimized */}
        {showWelcome && (
          <div className="mb-6 md:mb-8">
            <div className="bg-linear-to-r from-indigo-100 to-purple-100 rounded-lg md:rounded-xl p-4 md:p-6 shadow flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full">
                <div className="bg-indigo-200 p-3 md:p-4 rounded-full shrink-0">
                  <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-indigo-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    Welcome, {team?.teamName || "Team"}!
                  </h2>
                  <p className="text-sm md:text-base text-gray-700 max-w-xl leading-relaxed">
                    Your team is now registered. To get started:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700 text-xs md:text-sm space-y-1 leading-relaxed">
                    <li>
                      Click <b>Start Scanning</b> to open your camera.
                    </li>
                    <li>Scan the QR code at your current stage location.</li>
                    <li>
                      Each correct scan will advance your team and earn points.
                    </li>
                    <li>Check your progress and scan history below.</li>
                    <li>
                      View the{" "}
                      <a
                        href="/instructions"
                        className="text-indigo-600 underline"
                      >
                        Instructions
                      </a>{" "}
                      page for rules and tips.
                    </li>
                  </ul>
                </div>
              </div>
              <Button
                onClick={() => setShowWelcome(false)}
                variant="outline"
                className="w-full sm:w-auto mt-2 md:mt-0 shrink-0"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-purple-100 p-3 md:p-4 rounded-full">
              <QrCode className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            QR Scanner
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-2">
            Scan QR codes to progress through the hunt
          </p>

          {/* Team Status Banner */}
          {team && !team.isActive && (
            <Alert variant="destructive" className="mt-4 text-sm md:text-base">
              <AlertDescription className="text-center leading-relaxed">
                <strong>⚠️ You have been eliminated from the event.</strong>
                <br />
                Please scan a rejoin QR code provided by the admin to continue
                playing.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Team Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="hover:shadow-md transition-shadow shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3 p-3 md:p-4">
              <div className="bg-yellow-100 p-2 md:p-3 rounded-full">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Total Points
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {team?.points || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3 p-3 md:p-4">
              <div className="bg-green-100 p-2 md:p-3 rounded-full">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Current Stage
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {team?.currentStage || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3 p-3 md:p-4">
              <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Scans Made
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {scanHistory.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3 p-3 md:p-4">
              <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Your Rank
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {rank !== null ? `#${rank}` : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Scanner Section - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <QrCode className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                Scan QR Code
              </CardTitle>
            </CardHeader>

            <CardContent className="px-3 md:px-6">
              {/* Always render the qr-reader div, but toggle its visibility */}
              <div
                id="qr-reader"
                className={`mb-4 rounded-lg overflow-hidden ${
                  scanning ? "" : "hidden"
                }`}
                style={{ minHeight: scanning ? 260 : 0 }}
              ></div>
              {!scanning ? (
                <div className="text-center py-8 md:py-12">
                  <div className="bg-gray-100 rounded-full p-6 md:p-8 inline-block mb-4 md:mb-6">
                    <Camera className="h-12 w-12 md:h-20 md:w-20 text-gray-400" />
                  </div>
                  <p className="text-sm md:text-lg text-gray-600 mb-5 md:mb-6 px-2">
                    Click the button below to start scanning QR codes
                  </p>
                  <Button
                    onClick={startScanning}
                    size="lg"
                    className="w-full md:w-auto text-base md:text-lg py-6 md:py-3"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Scanning
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="secondary"
                  className="w-full text-base md:text-lg py-6 md:py-3"
                >
                  Stop Scanning
                </Button>
              )}

              <Alert
                variant="info"
                className="mt-4 md:mt-6 text-sm md:text-base"
              >
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <h3 className="font-semibold mb-2">Scanning Instructions:</h3>
                  <ul className="text-xs md:text-sm space-y-1 leading-relaxed">
                    <li>• Point your camera at a QR code</li>
                    <li>• Keep the code within the scan box</li>
                    <li>• Hold steady until scan completes</li>
                    <li>• Scan codes in the correct sequence</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Hint Display Section - Mobile Optimized */}
          {hintData && (
            <Card className="shadow-lg border-2 border-yellow-300 bg-yellow-50">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-lg md:text-xl">
                  <span className="flex items-center gap-2">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                    Your Hint
                  </span>
                  <div className="flex gap-2">
                    {hintData.scanPosition && (
                      <Badge variant="secondary" className="text-xs md:text-sm">
                        {getOrdinalSuffix(hintData.scanPosition)}
                      </Badge>
                    )}
                    <Badge variant="success" className="text-xs md:text-sm">
                      +{hintData.points} pts
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                {hintData.type === "text" && (
                  <div className="p-3 md:p-4 bg-white rounded-lg">
                    <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                      {hintData.value}
                    </p>
                  </div>
                )}
                {hintData.type === "image" && (
                  <div className="p-3 md:p-4 bg-white rounded-lg">
                    <img
                      src={hintData.value}
                      alt="Hint"
                      className="max-w-full rounded-lg shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23ddd" width="400" height="300"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">Image not found</text></svg>';
                      }}
                    />
                  </div>
                )}
                {hintData.type === "video" && (
                  <div className="p-3 md:p-4 bg-white rounded-lg">
                    <iframe
                      src={hintData.value}
                      className="w-full aspect-video rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Hint Video"
                    ></iframe>
                  </div>
                )}
                <Button
                  onClick={() => setHintData(null)}
                  variant="outline"
                  className="mt-4 w-full text-base md:text-lg py-6 md:py-3"
                >
                  Close Hint
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scan History Section - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-lg md:text-xl">
                <span>Recent Scans</span>
                {scanHistory.length > 0 && (
                  <Badge variant="secondary" className="text-xs md:text-sm">
                    {scanHistory.length} scans
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="bg-gray-100 rounded-full p-6 md:p-8 inline-block mb-3 md:mb-4">
                    <QrCode className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                  </div>
                  <p className="text-sm md:text-base text-gray-600 px-2">
                    No scans yet. Start scanning to see history!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 md:pr-2">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={scan._id || index}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        scan.success
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={scan.success ? "success" : "destructive"}
                            className="text-xs md:text-sm"
                          >
                            {scan.qrCode}
                          </Badge>
                          {scan.stage && (
                            <span className="text-xs text-gray-500">
                              Stage: {scan.stage}
                            </span>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`text-xs md:text-sm mb-2 leading-relaxed ${
                          scan.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {scan.message ||
                          (scan.success ? "Successful scan" : "Failed scan")}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {scan.pointsAwarded > 0 && (
                          <Badge variant="success" className="text-xs">
                            +{scan.pointsAwarded} points
                          </Badge>
                        )}
                        {scan.scanPosition && (
                          <Badge variant="secondary" className="text-xs">
                            {getOrdinalSuffix(scan.scanPosition)} to scan
                          </Badge>
                        )}
                        {scan.pointsDeducted > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{scan.pointsDeducted} points
                          </Badge>
                        )}
                      </div>

                      {scan.hint && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs md:text-sm">
                          <span className="font-semibold text-yellow-800">
                            Hint:
                          </span>{" "}
                          {scan.hint.type === "text" && (
                            <span className="text-gray-800 wrap-break-word">
                              {scan.hint.value}
                            </span>
                          )}
                          {scan.hint.type === "image" && (
                            <img
                              src={scan.hint.value}
                              alt="Hint"
                              className="max-h-24 mt-1 rounded"
                            />
                          )}
                          {scan.hint.type === "video" && (
                            <video
                              src={scan.hint.value}
                              controls
                              className="max-h-24 mt-1 rounded"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ScanQrPage;
