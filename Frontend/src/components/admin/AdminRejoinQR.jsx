import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Card, { CardHeader, CardTitle, CardContent } from "../Card";
import Button from "../Button";
import { Alert, AlertDescription } from "../Alert";
import Badge from "../Badge";
import Input from "../Input";
import Modal from "../Modal";
import { Plus, Trash2, Edit2, Download, QrCode, RefreshCw } from "lucide-react";

const AdminRejoinQR = () => {
  const [rejoinQRs, setRejoinQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    maxUsageCount: 1,
    pointsAdjustment: 0,
    expiresAt: "",
  });

  useEffect(() => {
    fetchRejoinQRs();
  }, []);

  const fetchRejoinQRs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllRejoinQRs();

      if (response?.success) {
        setRejoinQRs(response.data?.rejoinQRs || []);
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to load rejoin QR codes",
        });
      }
    } catch (error) {
      console.error("Error fetching rejoin QRs:", error);
      setMessage({
        type: "error",
        text:
          error?.message ||
          error ||
          "Failed to load rejoin QR codes. Please check your admin login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRejoinQR = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      setMessage({ type: "error", text: "Code and name are required" });
      return;
    }

    try {
      const response = await adminService.createRejoinQR({
        ...formData,
        code: formData.code.toUpperCase(),
        maxUsageCount: parseInt(formData.maxUsageCount),
        pointsAdjustment: parseInt(formData.pointsAdjustment),
        expiresAt: formData.expiresAt || null,
      });

      if (response?.success) {
        setMessage({
          type: "success",
          text: response.message || "Rejoin QR created successfully",
        });
        setShowCreateModal(false);
        setFormData({
          code: "",
          name: "",
          description: "",
          maxUsageCount: 1,
          pointsAdjustment: 0,
          expiresAt: "",
        });
        await fetchRejoinQRs();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to create rejoin QR",
        });
      }
    } catch (error) {
      console.error("Error creating rejoin QR:", error);
      setMessage({
        type: "error",
        text: error?.message || error || "Failed to create rejoin QR",
      });
    }
  };

  const handleDeleteRejoinQR = async (id, name) => {
    if (!confirm(`Delete rejoin QR "${name}"?`)) return;

    try {
      const response = await adminService.deleteRejoinQR(id);

      if (response?.success) {
        setMessage({
          type: "success",
          text: response.message || "Rejoin QR deleted successfully",
        });
        await fetchRejoinQRs();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to delete rejoin QR",
        });
      }
    } catch (error) {
      console.error("Error deleting rejoin QR:", error);
      setMessage({
        type: "error",
        text: error?.message || error || "Failed to delete rejoin QR",
      });
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await adminService.updateRejoinQR(id, {
        active: !currentStatus,
      });

      if (response?.success) {
        setMessage({
          type: "success",
          text:
            response.message ||
            `Rejoin QR ${
              !currentStatus ? "activated" : "deactivated"
            } successfully`,
        });
        await fetchRejoinQRs();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to update rejoin QR",
        });
      }
    } catch (error) {
      console.error("Error toggling rejoin QR:", error);
      setMessage({
        type: "error",
        text: error?.message || error || "Failed to update rejoin QR",
      });
    }
  };

  const downloadQRImage = (qrCodeImage, code) => {
    const link = document.createElement("a");
    link.href = qrCodeImage;
    link.download = `REJOIN_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rejoin QR Codes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create special QR codes that eliminated teams can scan to rejoin the
            event
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rejoin QR
        </Button>
      </div>

      {/* Rejoin QR List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rejoinQRs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No rejoin QR codes created yet</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
                variant="outline"
              >
                Create Your First Rejoin QR
              </Button>
            </CardContent>
          </Card>
        ) : (
          rejoinQRs.map((qr) => (
            <Card key={qr._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* QR Code Image */}
                {qr.qrCodeImage && (
                  <div className="mb-4 bg-white p-2 rounded border">
                    <img
                      src={qr.qrCodeImage}
                      alt={qr.code}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* QR Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {qr.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {qr.code}
                      </p>
                    </div>
                    <div>
                      {qr.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  {qr.description && (
                    <p className="text-sm text-gray-600">{qr.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Uses:</p>
                      <p className="font-semibold">
                        {qr.currentUsageCount} / {qr.maxUsageCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Points:</p>
                      <p className="font-semibold">
                        {qr.pointsAdjustment > 0 ? "+" : ""}
                        {qr.pointsAdjustment}
                      </p>
                    </div>
                  </div>

                  {qr.expiresAt && (
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(qr.expiresAt).toLocaleString()}
                    </div>
                  )}

                  {/* Teams that used this QR */}
                  {qr.usedByTeams && qr.usedByTeams.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-1">Used by:</p>
                      <div className="flex flex-wrap gap-1">
                        {qr.usedByTeams.slice(0, 3).map((usage, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {usage.teamName}
                          </Badge>
                        ))}
                        {qr.usedByTeams.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{qr.usedByTeams.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRImage(qr.qrCodeImage, qr.code)}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(qr._id, qr.active)}
                    >
                      {qr.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRejoinQR(qr._id, qr.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Rejoin QR Code"
      >
        <form onSubmit={handleCreateRejoinQR} className="space-y-4">
          <Input
            label="QR Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., REJOIN01"
            required
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., First Rejoin Pass"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Optional description"
          />
          <Input
            label="Max Usage Count"
            type="number"
            value={formData.maxUsageCount}
            onChange={(e) =>
              setFormData({ ...formData, maxUsageCount: e.target.value })
            }
            min="1"
            required
          />
          <Input
            label="Points Adjustment"
            type="number"
            value={formData.pointsAdjustment}
            onChange={(e) =>
              setFormData({ ...formData, pointsAdjustment: e.target.value })
            }
            placeholder="0 (positive to add, negative to deduct)"
          />
          <Input
            label="Expiry Date (Optional)"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create Rejoin QR
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRejoinQR;
