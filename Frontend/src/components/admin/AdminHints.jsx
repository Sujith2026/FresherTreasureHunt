import React, { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";
import Badge from "../Badge";
import toast from "react-hot-toast";
import {
  Lightbulb,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Eye,
  QrCode,
} from "lucide-react";
import Modal from "../Modal";

const AdminHints = () => {
  const [hints, setHints] = useState([]);
  const [qrStages, setQrStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [selectedHint, setSelectedHint] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({
    hintId: "",
    text: "",
    qrId: "",
    points: 15,
    hintType: "text",
    difficulty: "medium",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchHints();
    fetchQRStages();
  }, []);

  const fetchHints = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllHints();
      const data = response.data || response;
      setHints(data.hints || []);
    } catch (error) {
      toast.error("Failed to fetch hints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRStages = async () => {
    try {
      const response = await adminService.getAllQRStages();
      const data = response.data || response;
      setQrStages(data.stages || []);
    } catch (error) {
      console.error("Failed to fetch QR stages:", error);
    }
  };

  const getLinkedQR = (qrId) => {
    return qrStages.find((qr) => qr.code === qrId);
  };

  const handleViewDetails = (hint) => {
    setSelectedHint(hint);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      hintId: "",
      text: "",
      qrId: "",
      points: 15,
      hintType: "text",
      difficulty: "medium",
      active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingId) {
        await adminService.updateHint(editingId, formData);
        toast.success("Hint updated successfully!");
      } else {
        await adminService.createHint(formData);
        toast.success("Hint created successfully!");
      }
      resetForm();
      fetchHints();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to save hint";
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (hint) => {
    setFormData({
      hintId: hint.hintId,
      text: hint.text,
      qrId: hint.qrId,
      points: hint.points,
      hintType: hint.hintType || "text",
      difficulty: hint.difficulty || "medium",
      active: hint.active !== undefined ? hint.active : true,
    });
    setEditingId(hint._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (hintId) => {
    if (!window.confirm("Are you sure you want to delete this hint?")) {
      return;
    }

    try {
      await adminService.deleteHint(hintId);
      toast.success("Hint deleted successfully!");
      fetchHints();
    } catch (error) {
      toast.error("Failed to delete hint");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          Hint Management
        </h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "secondary"}
            onClick={() => setViewMode("grid")}
            size="sm"
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "secondary"}
            onClick={() => setViewMode("table")}
            size="sm"
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{editingId ? "Edit Hint" : "Create New Hint"}</span>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hint ID *
                </label>
                <input
                  type="text"
                  name="hintId"
                  value={formData.hintId}
                  onChange={handleInputChange}
                  placeholder="e.g., HINT_001"
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={editingId !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Target QR Code *
                </label>
                <input
                  type="text"
                  name="qrId"
                  value={formData.qrId}
                  onChange={handleInputChange}
                  placeholder="e.g., QR_LIBRARY"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hint Text *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter the riddle or clue..."
                className="w-full border rounded px-3 py-2"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Points *
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hint Type
                </label>
                <select
                  name="hintType"
                  value={formData.hintType}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <LoadingSpinner />
              ) : editingId ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Hint
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Hint
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hints List */}
      <h2 className="text-2xl font-bold mb-4">All Hints ({hints.length})</h2>

      {loading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : hints.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No hints found. Create one above!
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hints.map((hint) => {
            const linkedQR = getLinkedQR(hint.qrId);
            return (
              <Card
                key={hint._id}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{hint.hintId}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <QrCode className="w-3 h-3 text-gray-500" />
                        <p className="text-sm text-gray-600">{hint.qrId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          hint.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {hint.active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                          hint.difficulty
                        )}`}
                      >
                        {hint.difficulty || "medium"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {hint.text}
                    </p>
                  </div>

                  {linkedQR && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Linked QR:
                      </p>
                      <p className="text-xs text-blue-800">
                        {linkedQR.locationName || linkedQR.code}
                      </p>
                      <p className="text-xs text-blue-600">
                        Stage {linkedQR.stageIndex}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{hint.points} points</Badge>
                    <Badge variant="default">{hint.hintType || "text"}</Badge>
                  </div>

                  {hint.usedByTeams && hint.usedByTeams.length > 0 && (
                    <p className="text-xs text-gray-500 mb-3">
                      Used by {hint.usedByTeams.length} team(s)
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDetails(hint)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(hint)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(hint._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Hint ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Hint Text
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Target QR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Used By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hints.map((hint) => {
                  const linkedQR = getLinkedQR(hint.qrId);
                  return (
                    <tr key={hint._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm">
                          {hint.hintId}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800 line-clamp-2">
                          {hint.text}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-mono">{hint.qrId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {linkedQR?.locationName || "-"}
                        </span>
                        {linkedQR && (
                          <p className="text-xs text-gray-500">
                            Stage {linkedQR.stageIndex}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {hint.points}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                            hint.difficulty
                          )}`}
                        >
                          {hint.difficulty || "medium"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" className="text-xs">
                          {hint.hintType || "text"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {hint.usedByTeams?.length || 0} teams
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            hint.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {hint.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(hint)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(hint)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(hint._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedHint && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Hint Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Hint ID
                </label>
                <p className="text-lg font-bold">{selectedHint.hintId}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Target QR Code
                </label>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-gray-500" />
                  <p className="text-lg font-mono">{selectedHint.qrId}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Hint Text
              </label>
              <p className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded text-gray-800">
                {selectedHint.text}
              </p>
            </div>

            {getLinkedQR(selectedHint.qrId) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <label className="text-sm font-semibold text-blue-900 mb-2 block">
                  Linked QR Code Details
                </label>
                {(() => {
                  const qr = getLinkedQR(selectedHint.qrId);
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Code:</span>
                        <span className="text-sm font-mono text-blue-900">
                          {qr.code}
                        </span>
                      </div>
                      {qr.locationName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">
                            Location:
                          </span>
                          <span className="text-sm text-blue-900">
                            {qr.locationName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">
                          Stage Index:
                        </span>
                        <span className="text-sm text-blue-900">
                          {qr.stageIndex}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">
                          QR Points:
                        </span>
                        <span className="text-sm text-blue-900">
                          {qr.points}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">
                          Scan Count:
                        </span>
                        <span className="text-sm text-blue-900">
                          {qr.scanCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Status:</span>
                        <span
                          className={`text-sm ${
                            qr.active ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          {qr.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Points
                </label>
                <p className="text-lg">{selectedHint.points}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Type
                </label>
                <Badge variant="default">
                  {selectedHint.hintType || "text"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Difficulty
                </label>
                <span
                  className={`px-3 py-1 rounded ${getDifficultyColor(
                    selectedHint.difficulty
                  )}`}
                >
                  {selectedHint.difficulty || "medium"}
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Status
                </label>
                <p>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      selectedHint.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedHint.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            {selectedHint.usedByTeams &&
              selectedHint.usedByTeams.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Usage Statistics
                  </label>
                  <p className="text-sm text-gray-700 mt-1">
                    This hint has been used by{" "}
                    <strong>{selectedHint.usedByTeams.length}</strong> team(s)
                  </p>
                </div>
              )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleEdit(selectedHint);
                  setShowViewModal(false);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Hint
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminHints;
