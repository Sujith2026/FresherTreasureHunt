import React, { useState } from "react";
import adminService from "../services/adminService";
import Button from "../components/Button";
import { Card, CardContent } from "../components/Card";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminViewTeams from "../components/admin/AdminViewTeams";
import AdminCreateTeam from "../components/admin/AdminCreateTeam";
import AdminEditTeam from "../components/admin/AdminEditTeam";
import AdminLeaderboard from "../components/admin/AdminLeaderboard";
import AdminQRStages from "../components/admin/AdminQRStages";
import AdminQRImages from "../components/admin/AdminQRImages";
import AdminHints from "../components/admin/AdminHints";
import AdminEventControl from "../components/admin/AdminEventControl";
import AdminRejoinQR from "../components/admin/AdminRejoinQR";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";

function AdminDashboardPage() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [loginError, setLoginError] = useState("");
  const [qrStages, setQrStages] = useState([]);
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Team state
  const [editTeamId, setEditTeamId] = useState("");
  const [editTeam, setEditTeam] = useState(null);
  const [editForm, setEditForm] = useState({
    points: 0,
    isActive: true,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Handler: select team to edit
  const handleEditSelect = (e) => {
    const id = e.target.value;
    setEditTeamId(id);
    if (!id) {
      setEditTeam(null);
      setEditForm({
        points: 0,
        isActive: true,
      });
      return;
    }
    setEditLoading(true);
    adminService
      .getTeamById(id)
      .then((res) => {
        const team = res.data?.team || res.team;
        setEditTeam(team);
        setEditForm({
          points: team.points,
          isActive: team.isActive,
        });
      })
      .catch(() => {
        setEditTeam(null);
        toast.error("Failed to load team");
      })
      .finally(() => setEditLoading(false));
  };

  // Handler: edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handler: submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTeamId) return;
    setEditLoading(true);
    try {
      // Only update allowed fields
      const updates = {
        points: Number(editForm.points),
        isActive: !!editForm.isActive,
      };
      await adminService.updateTeam(editTeamId, updates);
      toast.success("Team updated");
      fetchTeams();
    } catch (err) {
      toast.error("Failed to update team");
    } finally {
      setEditLoading(false);
    }
  };
  // Create Team form state
  const [createForm, setCreateForm] = useState({
    teamName: "",
    leaderName: "",
    leaderEmail: "",
    password: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch leaderboard (example: use teams as leaderboard, or fetch from API)
  const fetchLeaderboard = async (adminToken = token) => {
    setLeaderboardLoading(true);
    try {
      // If you have a dedicated leaderboard API, use it here
      // const res = await adminService.getLeaderboard(adminToken);
      // setLeaderboard(res.data?.leaderboard || []);
      // For now, use teams sorted by points descending
      setLeaderboard(
        [...teams].sort((a, b) => (b.points || 0) - (a.points || 0))
      );
    } catch (err) {
      toast.error("Failed to fetch leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleRefreshLeaderboard = async () => {
    setRefreshing(true);
    await fetchTeams();
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // You may need to adjust the API call below to match your backend
      const res = await adminService.createTeam(createForm, token);
      if (res?.success) {
        toast.success("Team created successfully");
        setCreateForm({
          teamName: "",
          leaderName: "",
          leaderEmail: "",
          password: "",
        });
        fetchTeams();
        setActiveTab("view");
      } else {
        toast.error(res?.message || "Failed to create team");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create team");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await adminService.login({ username, password });
      if (res?.data?.token || res?.token) {
        const tok = res?.data?.token || res?.token;
        setToken(tok);
        setIsLoggedIn(true);
        toast.success("Admin login successful");
        fetchTeams(tok);
        fetchQrStages(tok);
      } else {
        setIsLoggedIn(false);
        setLoginError("Wrong credentials");
        toast.error(res.data?.message || res.message || "Wrong credentials");
      }
    } catch (err) {
      setIsLoggedIn(false);
      setLoginError("Wrong credentials");
      toast.error(
        err?.response?.data?.message || err?.message || "Wrong credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (adminToken = token) => {
    setLoading(true);
    try {
      const res = await adminService.getAllTeams(adminToken);
      const teamList = res.data?.teams || res.teams || [];
      setTeams(teamList);
      // Also populate leaderboard view from teams
      setLeaderboard(
        [...teamList].sort((a, b) => (b.points || 0) - (a.points || 0))
      );
    } catch (err) {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrStages = async (adminToken = token) => {
    try {
      const res = await adminService.getQRStages(adminToken);
      // apiClient returns response.data; backend shape: { success, count, data: { stages } }
      const stages = res?.data?.stages || [];
      setQrStages(stages);
    } catch (err) {
      toast.error("Failed to fetch QR stages");
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    setLoading(true);
    try {
      await adminService.deleteTeam(teamId, token);
      toast.success("Team deleted");
      fetchTeams();
    } catch (err) {
      toast.error("Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  const handleQrDelete = async (qrId) => {
    if (!window.confirm("Are you sure you want to delete this QR stage?"))
      return;
    try {
      await adminService.deleteQRStage(qrId, token);
      toast.success("QR stage deleted");
      fetchQrStages();
    } catch (err) {
      toast.error("Failed to delete QR stage");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    setUsername("");
    setPassword("");
    localStorage.removeItem("token");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar onLogout={isLoggedIn ? handleLogout : undefined} />
      <div className="flex flex-1">
        {/* Sidebar for admin navigation */}
        {isLoggedIn && (
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        <main className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            Admin Dashboard
          </h1>
          {!isLoggedIn ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded px-3 py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm text-center">
                      {loginError}
                    </div>
                  )}
                  <Button type="submit" className="w-full" loading={loading}>
                    <LogIn className="h-5 w-5 mr-2" />
                    Login as Admin
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === "event-control" && <AdminEventControl />}
              {activeTab === "view" && (
                <AdminViewTeams
                  teams={teams}
                  loading={loading}
                  fetchTeams={fetchTeams}
                  handleDelete={handleDelete}
                />
              )}
              {activeTab === "create" && (
                <AdminCreateTeam
                  createForm={createForm}
                  createLoading={createLoading}
                  handleCreateChange={handleCreateChange}
                  handleCreateSubmit={handleCreateSubmit}
                />
              )}
              {activeTab === "leaderboard" && (
                <AdminLeaderboard
                  leaderboard={leaderboard || []}
                  leaderboardLoading={leaderboardLoading}
                  refreshing={refreshing}
                  handleRefresh={handleRefreshLeaderboard}
                />
              )}
              {activeTab === "edit" && (
                <AdminEditTeam
                  teams={teams}
                  editTeamId={editTeamId}
                  setEditTeamId={setEditTeamId}
                  editTeam={editTeam}
                  editForm={editForm}
                  editLoading={editLoading}
                  handleEditSelect={handleEditSelect}
                  handleEditChange={handleEditChange}
                  handleEditSubmit={handleEditSubmit}
                />
              )}
              {activeTab === "qr" && (
                <AdminQRStages
                  token={token}
                  qrStages={qrStages}
                  fetchQrStages={fetchQrStages}
                  onDelete={handleQrDelete}
                />
              )}
              {activeTab === "qr-gallery" && <AdminQRImages />}
              {activeTab === "hints" && <AdminHints />}
              {activeTab === "rejoin-qr" && <AdminRejoinQR />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
