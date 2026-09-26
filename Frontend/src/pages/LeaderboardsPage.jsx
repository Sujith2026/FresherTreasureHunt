import React, { useState, useEffect } from "react";
import leaderboardService from "../services/leaderboardService";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "../components/Card";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

function LeaderboardsPage() {
  const { team } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardService.getLeaderboard();
      // Backend returns { success, count, data: { leaderboard } }
      setLeaderboard(response.data?.leaderboard || response.leaderboard || []);
    } catch (error) {
      toast.error("Failed to load leaderboard");
      console.error("Leaderboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
    toast.success("Leaderboard refreshed!");
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return "bg-linear-to-r from-yellow-50 to-yellow-100 border-yellow-300";
      case 2:
        return "bg-linear-to-r from-gray-50 to-gray-100 border-gray-300";
      case 3:
        return "bg-linear-to-r from-amber-50 to-amber-100 border-amber-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSpinner text="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 px-3 md:px-4 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="bg-yellow-100 p-3 md:p-4 rounded-full">
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Leaderboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-2">
            Real-time team rankings and scores
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4 md:mb-6">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            loading={refreshing}
            disabled={refreshing}
            className="text-sm md:text-base"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 md:space-y-4">
          {leaderboard.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="text-center py-12 md:py-16 px-4">
                <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-600 text-base md:text-lg">
                  No teams registered yet
                </p>
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((teamData, index) => {
              const isCurrentTeam =
                team &&
                (teamData.teamId === team.id ||
                  teamData.teamName === team.teamName);
              const rank = teamData.rank || index + 1;

              return (
                <Card
                  key={teamData.teamId || teamData._id || index}
                  className={`
                    border-2 transition-all duration-200 shadow-md
                    ${getRankClass(rank)}
                    ${isCurrentTeam ? "ring-2 ring-blue-500 shadow-lg" : ""}
                    hover:shadow-xl
                  `}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-6">
                      {/* Rank */}
                      <div className="shrink-0 w-12 md:w-16 text-center">
                        {getRankIcon(rank) || (
                          <div className="text-2xl md:text-3xl font-bold text-gray-600">
                            #{rank}
                          </div>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                          <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                            {teamData.teamName}
                          </h3>
                          {isCurrentTeam && (
                            <Badge
                              variant="default"
                              className="text-xs shrink-0"
                            >
                              YOUR TEAM
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs md:text-sm mb-2 md:mb-3">
                          <Award className="h-4 w-4 text-yellow-600 shrink-0" />
                          <span className="text-gray-600">Points:</span>
                          <Badge
                            variant="secondary"
                            className="font-bold text-xs md:text-sm"
                          >
                            {teamData.points}
                          </Badge>
                        </div>

                        {/* Member names removed as requested. Only showing member count above. */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <Card className="mt-6 md:mt-8 bg-blue-50 border-blue-200 shadow-md">
          <CardContent className="text-center py-3 md:py-4 px-3">
            <p className="text-xs md:text-sm text-blue-900 leading-relaxed">
              🔄 Auto-refreshes every 30 seconds • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LeaderboardsPage;
