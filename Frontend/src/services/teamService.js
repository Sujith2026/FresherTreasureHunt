import apiClient from '../config/api.js';

const teamService = {
    // Get team profile (details)
    getProfile: async () => {
        return await apiClient.get('/team');
    },

    // Add team member (update to match backend if needed)
    addMember: async (memberData) => {
        return await apiClient.post('/team/add-member', memberData);
    },

    // Remove team member
    removeMember: async (memberId) => {
        return await apiClient.delete(`/team/remove-member/${memberId}`);
    },

    // If scan history or stats endpoints are needed, implement them in the backend first
    // getScanHistory: async () => {
    //     return await apiClient.get('/team/scan-history');
    // },
    // getStats: async () => {
    //     return await apiClient.get('/team/stats');
    // },
};

export default teamService;
