import apiClient from '../config/api.js';

const leaderboardService = {
    // Get leaderboard
    getLeaderboard: async () => {
        return await apiClient.get('/leaderboard');
    },

    // Get live leaderboard (for polling)
    getLiveLeaderboard: async () => {
        return await apiClient.get('/leaderboard');
    },
};

export default leaderboardService;
