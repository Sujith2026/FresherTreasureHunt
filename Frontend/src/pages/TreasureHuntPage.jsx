import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import {
  QrCode,
  Camera,
  Award,
  TrendingUp,
  CheckCircle,
  Info,
  Play,
  MapPin,
  Target,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import leaderboardService from "../services/leaderboardService";
import scanService from "../services/scanService";
import teamService from "../services/teamService";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import Badge from "../components/Badge";
import { Alert, AlertDescription } from "../components/Alert";
import Button from "../components/Button";

const defaultProgress = {
  hintsCompleted: 0,
  totalHints: 0,
  wrongScans: 0,
  qrsScanned: 0,
  gameCompleted: false,
};

const normalizeHint = (hintObj, fallback = {}) => {
  if (!hintObj && !fallback.hintValue && !fallback.text) {
    return null;
  }

  const source = hintObj || {};
  const text =
    source.text ??
    source.hintText ??
    source.value ??
    fallback.hintValue ??
    fallback.text ??
    null;

  if (!text) {
    return null;
  }

  return {
    id: source.id ?? source.hintId ?? fallback.hintId ?? null,
    text,
    type: source.type ?? source.hintType ?? fallback.hintType ?? "text",
    receivedAt:
      source.receivedAt ?? source.timestamp ?? fallback.receivedAt ?? null,
  };
};

function TreasureHuntPage() {
  const { team, updateTeam } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState("game");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentHint, setCurrentHint] = useState(null);
  const [hintLog, setHintLog] = useState([]);
  const [progress, setProgress] = useState(defaultProgress);
  const [rank, setRank] = useState(null);
  const [eventStatus, setEventStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const scannerRef = useRef(null);
  const scanLock = useRef(true);
  const lastScannedQR = useRef(null);
  const scanModeRef = useRef("game"); // Add ref to track scan mode reliably

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const latestTeam = await loadTeamData();
      await loadGameState();
      await fetchRank(latestTeam);
      setIsLoading(false);
    };

    initialize();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          // ignore cleanup failure
        }
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = async () => {
    const latestTeam = await loadTeamData();
    await loadGameState();
    await fetchRank(latestTeam);
  };

  const loadTeamData = async () => {
    try {
      const response = await teamService.getProfile();
      const payload = response?.data || response;
      const teamData = payload?.team || payload?.data?.team || payload;
      if (teamData) {
        updateTeam(teamData);
      }
      return teamData;
    } catch (error) {
      console.error("Error loading team data:", error);
      return null;
    }
  };

  const loadGameState = async () => {
    try {
      const response = await scanService.getGameLogs();
      // Response structure after axios interceptor: { success: true, data: { currentHint, progress, hintLog } }

      console.log("loadGameState - Full response:", response);

      // Check if response is valid and has data
      if (!response || !response.success || !response.data) {
        console.log("loadGameState - No valid data found, resetting state");
        setGameStarted(false);
        setGameCompleted(false);
        setCurrentHint(null);
        setHintLog([]);
        setProgress(defaultProgress);
        return;
      }

      const {
        currentHint: hint,
        progress: progressData,
        hintLog: logs,
      } = response.data;

      console.log("loadGameState - currentHint from API:", hint);
      console.log("loadGameState - hintLog from API:", logs);
      console.log("loadGameState - progress from API:", progressData);

      const activeHint = normalizeHint(hint);
      console.log("loadGameState - normalized hint:", activeHint);

      const resolvedProgress = {
        hintsCompleted: progressData?.hintsCompleted || 0,
        totalHints: progressData?.totalHints || 0,
        wrongScans: progressData?.wrongScans || 0,
        qrsScanned: progressData?.qrsScanned || 0,
        gameCompleted: Boolean(progressData?.gameCompleted),
      };

      setProgress(resolvedProgress);
      setGameCompleted(resolvedProgress.gameCompleted);
      setGameStarted(
        Boolean(
          activeHint ||
            resolvedProgress.hintsCompleted > 0 ||
            resolvedProgress.totalHints > 0 ||
            resolvedProgress.gameCompleted
        )
      );

      setCurrentHint(activeHint);

      const normalizedHintLog = Array.isArray(logs)
        ? logs.map((log) => ({
            ...log,
            type: log.type || log.hintType || "text",
            hintText: log.hintText ?? log.text ?? log.hintValue ?? "",
          }))
        : [];

      setHintLog(normalizedHintLog);
      console.log("loadGameState - Final state:", {
        gameStarted: Boolean(
          activeHint ||
            resolvedProgress.hintsCompleted > 0 ||
            resolvedProgress.totalHints > 0 ||
            resolvedProgress.gameCompleted
        ),
        currentHint: activeHint,
        hintLog: normalizedHintLog,
        progress: resolvedProgress,
      });
    } catch (error) {
      console.error("Error loading game state:", error);
      setProgress(defaultProgress);
    }
  };

  const fetchRank = async (teamOverride = team) => {
    try {
      const response = await leaderboardService.getLeaderboard();
      const payload = response?.data || response;
      const leaderboard =
        payload?.leaderboard || payload?.data?.leaderboard || [];

      const activeTeam = teamOverride || team;
      if (!activeTeam || leaderboard.length === 0) {
        setRank(null);
        return;
      }

      const teamId = activeTeam._id || activeTeam.id;
      const found = leaderboard.find(
        (entry) =>
          entry.teamId === teamId || entry.teamName === activeTeam.teamName
      );

      setRank(found ? found.rank || leaderboard.indexOf(found) + 1 : null);
    } catch (error) {
      setRank(null);
    }
  };

  const handleStartGame = () => {
    if (eventStatus === "not_started") {
      toast.error("The event hasn't started yet. Please wait for the admin.");
      return;
    }

    if (gameCompleted) {
      toast.success("You have already completed the treasure hunt!");
      return;
    }

    startScanning("start");
  };

  const startScanning = (mode = "game") => {
    // Only check game state for regular game scanning, not for start or rejoin modes
    if (mode === "game") {
      if (!gameStarted) {
        toast.error("Please start the game first by scanning the start QR.");
        return;
      }

      if (!team?.isActive) {
        toast.error(
          "You have been eliminated. Scan a rejoin QR to continue playing."
        );
        return;
      }

      if (eventStatus === "ended") {
        toast.error("The event has ended. Scanning is disabled.");
        return;
      }

      if (gameCompleted) {
        toast.success("You have already completed the treasure hunt!");
        return;
      }
    }

    // Prevent rejoin scanning if team is already active
    if (mode === "rejoin" && team?.isActive) {
      toast.success("Your team is already active in the event.");
      return;
    }

    // Prevent starting game if already started
    if (mode === "start" && gameStarted) {
      toast.error("Game already started. You can scan game QR codes now.");
      return;
    }

    setScanMode(mode);
    scanModeRef.current = mode; // Update ref immediately
    setScanning(true);
    scanLock.current = true;
    lastScannedQR.current = null;

    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        // ignore stale scanner
      }
      scannerRef.current = null;
    }

    setTimeout(() => {
      try {
        // Mobile-optimized scanner settings
        const isMobile = window.innerWidth < 768;
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: isMobile
              ? {
                  width: Math.min(250, window.innerWidth - 80),
                  height: Math.min(250, window.innerWidth - 80),
                }
              : { width: 250, height: 250 },
            aspectRatio: 1.0,
            // Mobile-friendly settings
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
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

        scanLock.current = false;
      } catch (err) {
        toast.error(`Failed to start camera: ${err.message || err}`);
        setScanning(false);
      }
    }, 100);
  };

  const stopScanning = (resetMode = true) => {
    scanLock.current = true;
    lastScannedQR.current = null;

    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        // ignore cleanup issue
      }
      scannerRef.current = null;
    }

    setScanning(false);
    if (resetMode) {
      setScanMode("game");
    }
  };

  const handleEventStatusResponse = (status) => {
    if (!status) return;
    setEventStatus(status);

    if (status === "not_started") {
      toast.error(
        "The event hasn't started yet. Please wait for the admin to begin.",
        { icon: "⏸️", duration: 5000 }
      );
    } else if (status === "ended") {
      toast.error("The event has ended. Scanning is closed.", {
        icon: "⏹️",
        duration: 5000,
      });
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (scanLock.current) return;
    scanLock.current = true;

    try {
      const qrValue = (decodedText || "").trim().toUpperCase();
      const currentMode = scanModeRef.current; // Use ref instead of state

      console.log("=== QR SCAN DEBUG ===");
      console.log("Scanned QR:", qrValue);
      console.log("Current scanMode (ref):", currentMode);
      console.log("Current scanMode (state):", scanMode);
      console.log("Current gameStarted:", gameStarted);

      if (!qrValue) {
        toast.error("Scanned QR code is empty or invalid.");
        return;
      }

      if (lastScannedQR.current === qrValue) {
        console.log("Duplicate scan detected, ignoring");
        return;
      }
      lastScannedQR.current = qrValue;

      stopScanning(false);

      let response;
      console.log(`Calling API with mode: ${currentMode}`);

      // Use the ref value instead of state
      if (currentMode === "rejoin") {
        response = await scanService.scanRejoinQR(qrValue);
      } else if (currentMode === "start") {
        response = await scanService.startGame(qrValue);
      } else {
        response = await scanService.scanQRNew(qrValue);
      }

      // Response is already unwrapped by axios interceptor
      // Backend sends: { success: true, data: {...} }
      // Axios interceptor returns: response.data which is { success: true, data: {...} }
      const data = response;

      console.log("Scan response data:", data);

      if (data?.eventStatus) {
        if (
          data.eventStatus === "not_started" ||
          data.eventStatus === "ended"
        ) {
          handleEventStatusResponse(data.eventStatus);
          return;
        }
        setEventStatus(data.eventStatus);
      }

      if (currentMode === "rejoin") {
        if (!data?.success) {
          toast.error(data?.message || "Failed to rejoin. Try again.");
          return;
        }

        toast.success(data.message || "Welcome back!", {
          icon: "🎉",
          duration: 4000,
        });

        if (data.team) {
          updateTeam(data.team);
        }

        await refreshAll();
        setScanMode("game");
        scanModeRef.current = "game";
        return;
      }

      if (currentMode === "start") {
        if (!data?.success) {
          toast.error(data?.message || "Unable to start the game. Try again.");
          return;
        }

        console.log("START scan response:", data);

        toast.success(data.message || "Game started!", {
          icon: "🚀",
          duration: 4000,
        });

        // Normalize the hint from the start response
        const startHint = normalizeHint(data.hint, {
          hintType: data.hintType,
          hintValue: data.hintValue,
          hintId: data.hint?.id || data.hintId,
        });

        console.log("START scan - normalized hint:", startHint);

        // Update game state immediately
        setGameStarted(true);
        if (startHint) {
          setCurrentHint(startHint);
          console.log("START scan - currentHint set to:", startHint);
        }

        // Update team data and refresh leaderboard
        if (data.team) {
          updateTeam(data.team);
        }

        // Refresh all data from backend to sync state
        await refreshAll();
        setScanMode("game");
        scanModeRef.current = "game";
        return;
      }

      if (data?.eliminated) {
        toast.error(
          data.message ||
            "You have been eliminated. Please scan a rejoin QR provided by the admin.",
          { icon: "❌", duration: 6000 }
        );
        await loadTeamData();
        return;
      }

      if (data?.status === "correct") {
        toast.success(
          data.message || `Correct! +${data.pointsAwarded || 0} points`,
          { icon: "✅", duration: 5000 }
        );

        const nextHint = normalizeHint(data.nextHint, {
          hintType: data.hintType,
          hintValue: data.hintValue,
          hintId: data.nextHint?.id || data.hintId,
        });

        if (nextHint) {
          setCurrentHint(nextHint);
        }

        if (data.gameCompleted) {
          setGameCompleted(true);
          toast.success(
            data.completionMessage ||
              "🎉 Congratulations! You've completed the treasure hunt!",
            { duration: 6000 }
          );
        }

        await refreshAll();
        return;
      }

      if (data?.status === "wrong") {
        toast.error(
          data.message ||
            `Wrong QR scanned! -${data.pointsDeducted || 0} points`,
          { icon: "⚠️", duration: 5000 }
        );

        const currentHintAfterWrong = normalizeHint(data.currentHint, {
          hintType: data.hintType,
          hintValue: data.hintValue,
          hintId: data.currentHint?.id || data.hintId,
        });

        if (currentHintAfterWrong) {
          setCurrentHint(currentHintAfterWrong);
        }

        await refreshAll();
        return;
      }

      if (data?.success === false) {
        toast.error(data?.message || "Scan failed. Please try again.");
        return;
      }

      toast.error("Scan failed. Please try again.");
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.message ||
        error?.response?.data?.message ||
        "Scan failed. Please try again.";
      toast.error(message);
    } finally {
      scanLock.current = false;
    }
  };

  const isEliminated = team && team.isActive === false;
  const currentPoints = team?.points || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
      {/* Mobile-optimized header */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Target className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Treasure Hunt</h1>
          </div>
          <p className="text-center text-purple-100 text-sm md:text-base">
            {gameCompleted
              ? "🎉 Hunt completed! Great job!"
              : gameStarted
              ? "🔍 Follow the hints to find the treasure!"
              : "🚀 Start your treasure hunt adventure"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* Alerts */}
        {eventStatus === "not_started" && (
          <Alert variant="warning" className="mb-4 shadow-md">
            <AlertDescription className="text-center text-sm md:text-base">
              ⏸️ The event hasn't started yet. Watch for an announcement from
              the admin.
            </AlertDescription>
          </Alert>
        )}

        {eventStatus === "ended" && (
          <Alert variant="destructive" className="mb-4 shadow-md">
            <AlertDescription className="text-center text-sm md:text-base">
              ⏹️ The event has ended. Thanks for participating!
            </AlertDescription>
          </Alert>
        )}

        {isEliminated && (
          <Alert variant="destructive" className="mb-4 shadow-md">
            <AlertDescription className="text-center">
              <strong className="block mb-2 text-base md:text-lg">
                ⚠️ You have been eliminated
              </strong>
              <span className="text-sm md:text-base">
                Ask an admin for a rejoin QR code and scan it below to continue
                playing.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">
                    Points
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {currentPoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">
                    Completed
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {progress.hintsCompleted}/{progress.totalHints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">
                    Wrong
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {progress.wrongScans}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">
                    Rank
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {rank !== null ? `#${rank}` : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Main Content Card - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                {gameCompleted
                  ? "Hunt Complete!"
                  : gameStarted
                  ? "Current Clue"
                  : "Start Your Adventure"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {!gameStarted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="bg-purple-100 rounded-full p-6 md:p-8 inline-block mb-4 md:mb-6">
                    <Play className="h-12 w-12 md:h-20 md:w-20 text-purple-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                    Ready to Begin?
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 px-2">
                    Scan the start QR to begin your treasure hunt and receive
                    your first clue.
                  </p>
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    className="w-full md:w-auto text-base md:text-lg py-6 md:py-3"
                    disabled={eventStatus === "ended"}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Scan Start QR
                  </Button>
                </div>
              ) : gameCompleted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="bg-green-100 rounded-full p-6 md:p-8 inline-block mb-4 md:mb-6">
                    <Award className="h-12 w-12 md:h-20 md:w-20 text-green-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                    Congratulations!
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-2">
                    You've completed the treasure hunt!
                  </p>
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">
                    {currentPoints} Points
                  </div>
                </div>
              ) : currentHint ? (
                <div className="py-3 md:py-4">
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 md:p-6 mb-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="bg-yellow-200 p-2 rounded-full shrink-0">
                        <Info className="h-4 w-4 md:h-5 md:w-5 text-yellow-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base text-yellow-900 mb-2">
                          Your Current Hint
                        </h4>
                        {currentHint.type === "image" && (
                          <div className="rounded-lg overflow-hidden bg-white border border-yellow-200">
                            <img
                              src={currentHint.text}
                              alt="Current hint"
                              className="w-full max-h-48 md:max-h-64 object-contain"
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src =
                                  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect fill='%23fef3c7' width='400' height='300'/><text fill='%239b2c2c' x='50%' y='50%' text-anchor='middle' dy='.3em'>Image not available</text></svg>";
                              }}
                            />
                          </div>
                        )}
                        {currentHint.type === "video" && (
                          <div className="rounded-lg overflow-hidden bg-black aspect-video">
                            <iframe
                              src={currentHint.text}
                              title="Hint video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        {currentHint.type !== "image" &&
                          currentHint.type !== "video" && (
                            <p className="text-base md:text-lg text-gray-800 whitespace-pre-line leading-relaxed">
                              {currentHint.text}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  <Alert variant="info" className="text-sm md:text-base">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Follow this clue to find the next QR code location!
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <p className="text-center text-sm md:text-base text-gray-600 py-6 md:py-8 px-2">
                  {isLoading
                    ? "Loading your current hint..."
                    : "No active hint. Scan the correct QR to receive one."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* QR Scanner Card - Mobile Optimized */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <QrCode className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                QR Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div
                id="qr-reader"
                className={`mb-4 rounded-lg overflow-hidden ${
                  scanning ? "" : "hidden"
                }`}
                style={{ minHeight: scanning ? 260 : 0 }}
              ></div>

              {!scanning ? (
                <div className="space-y-4">
                  <div className="text-center py-6 md:py-8">
                    <div className="bg-gray-100 rounded-full p-6 md:p-8 inline-block mb-4 md:mb-6">
                      <Camera className="h-12 w-12 md:h-20 md:w-20 text-gray-400" />
                    </div>
                    <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 px-2">
                      {gameStarted
                        ? "Scan the QR code at your current location."
                        : "Scan the start QR to begin the game."}
                    </p>
                    <div className="flex flex-col md:flex-row gap-3 justify-center px-2">
                      {!gameStarted ? (
                        <Button
                          onClick={handleStartGame}
                          size="lg"
                          className="w-full md:w-auto text-base md:text-lg py-6 md:py-3"
                          disabled={eventStatus === "ended"}
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Scan Start QR
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startScanning("game")}
                          size="lg"
                          className="w-full md:w-auto text-base md:text-lg py-6 md:py-3"
                          disabled={
                            !gameStarted ||
                            gameCompleted ||
                            eventStatus === "ended" ||
                            isEliminated
                          }
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Scan Game QR
                        </Button>
                      )}
                      <Button
                        onClick={() => startScanning("rejoin")}
                        variant="outline"
                        className="w-full md:w-auto text-base md:text-lg py-6 md:py-3"
                        disabled={!isEliminated}
                      >
                        Rejoin QR
                      </Button>
                    </div>
                  </div>
                  <Alert variant="info" className="text-sm md:text-base">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <h3 className="font-semibold mb-2">How to scan:</h3>
                      <ul className="text-xs md:text-sm space-y-1">
                        <li>• Point your camera at the QR code</li>
                        <li>• Keep the code within the scan box</li>
                        <li>• Hold steady until the scan completes</li>
                        <li>• Make sure you're at the correct location</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Button
                  onClick={() => stopScanning(true)}
                  variant="secondary"
                  className="w-full text-base md:text-lg py-6 md:py-3"
                >
                  Stop Scanning
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hint History - Mobile Optimized */}
        {hintLog.length > 0 && (
          <Card className="shadow-lg mt-6 md:mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <span>Hint History</span>
                <Badge variant="secondary" className="text-xs md:text-sm">
                  {hintLog.length} hints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 md:pr-2">
                {hintLog.map((log, index) => (
                  <div
                    key={`${log.hintId}-${index}`}
                    className={`p-3 md:p-4 rounded-lg border-2 ${
                      log.status === "completed"
                        ? "bg-green-50 border-green-200"
                        : log.status === "wrong"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "success"
                            : log.status === "wrong"
                            ? "destructive"
                            : "default"
                        }
                        className="text-xs md:text-sm"
                      >
                        {log.status === "completed"
                          ? "✓ Completed"
                          : log.status === "wrong"
                          ? "✗ Wrong"
                          : "→ Active"}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mb-2">
                      {log.type === "image" && log.hintText ? (
                        <img
                          src={log.hintText}
                          alt="Hint"
                          className="max-h-32 rounded border border-yellow-200 bg-white"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect fill='%23fee2e2' width='300' height='200'/><text fill='%239b2c2c' x='50%' y='50%' text-anchor='middle' dy='.3em'>Image not available</text></svg>";
                          }}
                        />
                      ) : log.type === "video" && log.hintText ? (
                        <div className="aspect-video bg-black rounded overflow-hidden">
                          <iframe
                            src={log.hintText}
                            title={`Hint video ${log.hintId}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <span className="wrap-break-word">
                          {log.hintText || "Hint details unavailable."}
                        </span>
                      )}
                    </p>
                    {typeof log.pointsEarned === "number" &&
                      log.pointsEarned !== 0 && (
                        <Badge
                          variant={
                            log.pointsEarned > 0 ? "success" : "destructive"
                          }
                          className="text-xs mt-2"
                        >
                          {log.pointsEarned > 0 ? "+" : ""}
                          {log.pointsEarned} points
                        </Badge>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default TreasureHuntPage;
