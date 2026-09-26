import React from "react";
import { Card, CardContent } from "../Card";
import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";
import Badge from "../Badge";
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Users,
  Target,
  XCircle,
} from "lucide-react";

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

const AdminLeaderboard = ({
  leaderboard,
  leaderboardLoading,
  refreshing,
  handleRefresh,
}) => (
  <div className="py-8 px-2">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Trophy className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h2>
        <p className="text-gray-600">Real-time team rankings and scores</p>
      </div>
      <div className="flex justify-end mb-6">
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          loading={refreshing}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        {leaderboardLoading ? (
          <LoadingSpinner text="Loading leaderboard..." />
        ) : leaderboard.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No teams registered yet</p>
            </CardContent>
          </Card>
        ) : (
          leaderboard.map((teamData, index) => {
            const rank = teamData.rank || index + 1;
            return (
              <Card
                key={teamData.teamId || teamData._id || index}
                className={`
                  border-2 transition-all duration-200
                  ${getRankClass(rank)}
                  hover:shadow-xl
                `}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="shrink-0 w-16 text-center">
                      {getRankIcon(rank) || (
                        <div className="text-3xl font-bold text-gray-600">
                          #{rank}
                        </div>
                      )}
                    </div>
                    <div className="grow">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {teamData.teamName}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-600">Points:</span>
                          <Badge variant="secondary" className="font-bold">
                            {teamData.points}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">Hints:</span>
                          <Badge variant="success">
                            {teamData.completedHints ?? 0}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-gray-600">Wrong Scans:</span>
                          <Badge variant="outline">
                            {teamData.wrongScans ?? 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="text-center py-4">
          <p className="text-sm text-blue-900">
            🔄 Auto-refreshes every 30 seconds • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AdminLeaderboard;
