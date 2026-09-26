import React from "react";
import { Card, CardContent } from "../Card";
import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";

const AdminEditTeam = ({
  teams,
  editTeamId,
  setEditTeamId,
  editTeam,
  editForm,
  editLoading,
  handleEditSelect,
  handleEditChange,
  handleEditSubmit,
}) => (
  <Card className="max-w-lg mx-auto">
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Team</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={editTeamId}
          onChange={handleEditSelect}
        >
          <option value="">-- Select a team --</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>
      {editLoading ? (
        <LoadingSpinner text="Loading team..." />
      ) : editTeam ? (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Points</label>
            <input
              type="number"
              name="points"
              className="w-full border rounded px-3 py-2"
              value={editForm.points}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={editForm.isActive}
              onChange={handleEditChange}
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm">
              Active
            </label>
          </div>
          <Button type="submit" className="w-full" loading={editLoading}>
            Save Changes
          </Button>
        </form>
      ) : editTeamId ? (
        <div className="text-red-500">Team not found or failed to load.</div>
      ) : null}
    </CardContent>
  </Card>
);

export default AdminEditTeam;
