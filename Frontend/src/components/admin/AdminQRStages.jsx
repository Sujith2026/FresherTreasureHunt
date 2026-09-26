import { Download, Edit, QrCode, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button";
import { Card, CardContent } from "../Card";
import LoadingSpinner from "../LoadingSpinner";

const AdminQRStages = ({ qrStages, qrLoading, fetchQrStages, onDelete }) => {
  const [formData, setFormData] = useState({
    code: "",
    hints: [""],
    points: "",
    stageIndex: "", // 🎯 FIX: Added stageIndex to state
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const qrRef = useRef();

  const handleFormChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleHintChange = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  const addHintField = () => {
    setFormData({ ...formData, hints: [...formData.hints, ""] });
  };

  const removeHintField = (index) => {
    if (formData.hints.length <= 1) {
      toast.error("At least one hint field is required");
      return;
    }
    const newHints = formData.hints.filter((_, i) => i !== index);
    setFormData({ ...formData, hints: newHints });
  };

  // Generate QR and save to backend
  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setShowQRPreview(false);
    setGeneratedCode("");

    try {
      const normalizedCode = (formData.code || "").trim().toUpperCase();
      if (!normalizedCode) {
        toast.error("Code is required");
        return;
      }

      // 🎯 FIX: Also check for stageIndex
      if (!formData.stageIndex) {
        toast.error("Stage Index is required");
        return;
      }

      const hasDupCode =
        Array.isArray(qrStages) &&
        qrStages.some(
          (s) => s.code?.toUpperCase() === normalizedCode && s._id !== editingId
        );
      if (hasDupCode) {
        toast.error("A QR with this code already exists.");
        return;
      }

      // 🎯 FIX: Check for duplicate stageIndex
      const hasDupIndex =
        Array.isArray(qrStages) &&
        qrStages.some(
          (s) =>
            s.stageIndex === Number(formData.stageIndex) && s._id !== editingId
        );
      if (hasDupIndex) {
        toast.error("A QR with this Stage Index already exists.");
        return;
      }

      const url = editingId ? `/api/admin/qr/${editingId}` : "/api/admin/qr";
      const method = editingId ? "PATCH" : "POST";
      const token = localStorage.getItem("token");

      // 🎯 FIX: Transform hints to object array and add stageIndex
      const hintsAsObjects = formData.hints
        .map((hintText, i) => ({
          index: i + 1,
          hint: hintText,
        }))
        .filter((h) => h.hint.trim() !== "");

      if (hintsAsObjects.length === 0) {
        toast.error("At least one hint is required.");
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: normalizedCode,
          hints: hintsAsObjects, // 🎯 FIX: Send the correct object array
          points: Number(formData.points) || 100, // Default to 100 if empty
          active: formData.active,
          stageIndex: Number(formData.stageIndex), // 🎯 FIX: Send the stageIndex
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // This is where your 400 error is caught
        toast.error(data?.message || "Failed to generate QR");
        return;
      }

      if (data?.success) {
        toast.success(editingId ? "QR updated!" : "QR generated!");
        setShowQRPreview(true);
        setGeneratedCode(normalizedCode);
        fetchQrStages();
        handleCancelEdit(); // Reset form after success
      } else {
        toast.error(data?.message || "Failed to save QR");
      }
    } catch {
      toast.error("Failed to generate QR");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (qr) => {
    setEditingId(qr._id);
    setFormData({
      code: qr.code,
      // 🎯 FIX: Transform hints object array back into a simple string array for the form
      hints:
        qr.hints && qr.hints.length > 0 ? qr.hints.map((h) => h.hint) : [""],
      points: qr.points || 0,
      active: qr.active,
      stageIndex: qr.stageIndex, // 🎯 FIX: Populate stageIndex on edit
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      code: "",
      hints: [""],
      points: "",
      active: true,
      stageIndex: "", // 🎯 FIX: Reset stageIndex
    });
  };

  const downloadQR = (code, isPreview = false) => {
    const canvas = isPreview
      ? qrRef.current?.querySelector("canvas")
      : document.querySelector(`[data-qr-code="${code}"]`);

    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${code}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="w-8 h-8" />
          QR Stage Manager
        </h1>
      </div>

      {/* Form */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit QR Stage" : "Generate New QR Stage"}
          </h2>

          {showQRPreview && generatedCode && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-800">
                  QR Generated Successfully!
                </h3>
                <Button
                  size="sm"
                  onClick={() => downloadQR(generatedCode, true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div ref={qrRef} className="flex justify-center">
                <QRCodeCanvas value={generatedCode} size={200} />
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateQR} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  QR Code *
                </label>
                <input
                  type="text"
                  name="code"
                  className="w-full border rounded px-3 py-2"
                  value={formData.code}
                  onChange={handleFormChange}
                  placeholder="e.g., QR-01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stage Index *
                </label>
                <input
                  type="number"
                  name="stageIndex"
                  className="w-full border rounded px-3 py-2"
                  value={formData.stageIndex}
                  onChange={handleFormChange}
                  placeholder="A unique number, e.g., 1"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hints *</label>
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder={`Hint ${index + 1}`}
                    value={hint}
                    onChange={(e) => handleHintChange(index, e.target.value)}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeHintField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" size="sm" onClick={addHintField}>
                + Add Hint
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  name="points"
                  className="w-full border rounded px-3 py-2"
                  value={formData.points}
                  onChange={handleFormChange}
                  placeholder="Default: 100"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <LoadingSpinner />
                ) : editingId ? (
                  "Update QR"
                ) : (
                  "Generate QR"
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR List */}
      <h2 className="text-xl font-bold mt-10 mb-4">All Generated QRs</h2>
      {qrLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : !Array.isArray(qrStages) || qrStages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No QR stages found. Create one above!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrStages.map((qr) => (
            <Card key={qr._id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{qr.code}</h3>
                    <p className="text-sm text-gray-600">
                      Stage {qr.stageIndex} • {qr.points} pts
                    </p>
                  </div>
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

                <div className="mb-3 flex justify-center bg-gray-50 p-2 rounded">
                  <QRCodeCanvas
                    value={qr.code}
                    size={150}
                    data-qr-code={qr.code}
                  />
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Hints:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {qr.hints && qr.hints.length > 0 ? (
                      qr.hints.map((hintObj, idx) => (
                        <li key={idx}>{hintObj.hint}</li>
                      ))
                    ) : (
                      <li className="text-gray-400">No hints</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadQR(qr.code)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(qr)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(qr._id)}
                  >
                    <Trash2 className="w-4 h-4" />
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

export default AdminQRStages;
