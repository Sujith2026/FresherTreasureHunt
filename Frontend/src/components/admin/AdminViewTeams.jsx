import React from "react";
import { Card, CardContent } from "../Card";
import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";
import Badge from "../Badge";
import { Users, UserX, UserCheck } from "lucide-react";
import adminService from "../../services/adminService";

const AdminViewTeams = ({ teams, loading, fetchTeams, handleDelete }) => {
  const [actionLoading, setActionLoading] = React.useState(false);

  const handleEliminate = async (teamId, teamName) => {
    if (
      !confirm(
        `Eliminate team "${teamName}"? They will need a rejoin QR to continue.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.eliminateTeam(teamId);
      const payload = response?.data || response;

      if (payload?.success) {
        alert(payload.message || `Team "${teamName}" has been eliminated`);
        await fetchTeams();
      } else {
        alert(payload?.message || "Failed to eliminate team");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to eliminate team");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (teamId, teamName) => {
    if (!confirm(`Reactivate team "${teamName}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.reactivateTeam(teamId);
      const payload = response?.data || response;

      if (payload?.success) {
        alert(payload.message || `Team "${teamName}" has been reactivated`);
        await fetchTeams();
      } else {
        alert(payload?.message || "Failed to reactivate team");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reactivate team");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Teams</h2>
        <Button
          onClick={fetchTeams}
          size="sm"
          variant="outline"
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading teams..." />
      ) : (
        <div className="space-y-4">
          {teams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No teams found</p>
              </CardContent>
            </Card>
          ) : (
            teams.map((team) => {
              const completedHints = Array.isArray(team.hintLog)
                ? team.hintLog.filter((hint) => hint.status === "completed")
                    .length
                : 0;
              const activeHint = Array.isArray(team.hintLog)
                ? team.hintLog.find((hint) => hint.status === "active")
                : null;
              const wrongScans = team.wrongScans || 0;

              return (
                <Card key={team._id} className="border-2 hover:shadow-lg">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {team.teamName}
                        </h3>
                        <Badge variant="secondary">{team.points} pts</Badge>
                        {team.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Eliminated</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>Completed Hints: {completedHints}</span>
                        <span>Wrong Scans: {wrongScans}</span>
                        {activeHint ? (
                          <span>Active Hint: {activeHint.hintId}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {team.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEliminate(team._id, team.teamName)
                          }
                          disabled={loading || actionLoading}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Eliminate
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleReactivate(team._id, team.teamName)
                          }
                          disabled={loading || actionLoading}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(team._id)}
                        disabled={loading || actionLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </>
  );
};

export default AdminViewTeams;
