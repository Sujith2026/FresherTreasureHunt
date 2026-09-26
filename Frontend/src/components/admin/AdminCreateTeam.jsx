import React from "react";
import { Card, CardContent } from "../Card";
import Button from "../Button";

const AdminCreateTeam = ({
  createForm,
  createLoading,
  handleCreateChange,
  handleCreateSubmit,
}) => (
  <Card className="max-w-lg mx-auto">
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
      <form onSubmit={handleCreateSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input
            type="text"
            name="teamName"
            className="w-full border rounded px-3 py-2"
            value={createForm.teamName}
            onChange={handleCreateChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Leader Name</label>
          <input
            type="text"
            name="leaderName"
            className="w-full border rounded px-3 py-2"
            value={createForm.leaderName}
            onChange={handleCreateChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Leader Email</label>
          <input
            type="email"
            name="leaderEmail"
            className="w-full border rounded px-3 py-2"
            value={createForm.leaderEmail}
            onChange={handleCreateChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-3 py-2"
            value={createForm.password}
            onChange={handleCreateChange}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" loading={createLoading}>
          Create Team
        </Button>
      </form>
    </CardContent>
  </Card>
);

export default AdminCreateTeam;
