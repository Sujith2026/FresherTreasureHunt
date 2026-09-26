import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Card, { CardHeader, CardTitle, CardContent } from "../Card";
import Button from "../Button";
import { Alert, AlertDescription } from "../Alert";
import Badge from "../Badge";
import { Play, StopCircle, RefreshCw } from "lucide-react";

const AdminEventControl = () => {
  const [eventSettings, setEventSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEventSettings();
  }, []);

  const fetchEventSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEventSettings();

      if (response?.success) {
        setEventSettings(response.data?.settings || null);
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to load event settings",
        });
      }
    } catch (error) {
      console.error("Error fetching event settings:", error);
      setMessage({
        type: "error",
        text:
          error?.message ||
          error ||
          "Failed to load event settings. Please check your admin login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to START the event? Teams will be able to scan QR codes."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.startEvent("admin");

      if (response?.success) {
        setMessage({ type: "success", text: response.message });
        await fetchEventSettings();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to start event",
        });
      }
    } catch (error) {
      console.error("Error starting event:", error);
      setMessage({
        type: "error",
        text: error?.message || error || "Failed to start event",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to END the event? No further scans will be allowed."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.endEvent("admin");

      if (response?.success) {
        setMessage({ type: "success", text: response.message });
        await fetchEventSettings();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to end event",
        });
      }
    } catch (error) {
      console.error("Error ending event:", error);
      setMessage({
        type: "error",
        text: error?.message || error || "Failed to end event",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "not_started":
        return <Badge variant="secondary">Not Started</Badge>;
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <Alert variant={message.type === "error" ? "destructive" : "success"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Event Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Event Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {eventSettings?.eventName || "Treasure Hunt Event"}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(eventSettings?.eventStatus)}
                {eventSettings?.startedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Started:{" "}
                    {new Date(eventSettings.startedAt).toLocaleString()}
                  </p>
                )}
                {eventSettings?.endedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ended: {new Date(eventSettings.endedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Event Status Description */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                {eventSettings?.eventStatus === "not_started" &&
                  "⏸️ Event has not started. Teams cannot scan QR codes yet."}
                {eventSettings?.eventStatus === "active" &&
                  "▶️ Event is active! Teams can scan QR codes and play."}
                {eventSettings?.eventStatus === "ended" &&
                  "⏹️ Event has ended. No further scans are allowed."}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleStartEvent}
                disabled={
                  actionLoading ||
                  eventSettings?.eventStatus === "active" ||
                  eventSettings?.eventStatus === "ended"
                }
                className="flex-1"
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Event
              </Button>

              <Button
                onClick={handleEndEvent}
                disabled={
                  actionLoading ||
                  eventSettings?.eventStatus === "not_started" ||
                  eventSettings?.eventStatus === "ended"
                }
                className="flex-1"
                variant="destructive"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Event
              </Button>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Start Event:</strong> Teams can begin scanning QR codes
              </p>
              <p>
                <strong>End Event:</strong> All scans will be disabled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventControl;
