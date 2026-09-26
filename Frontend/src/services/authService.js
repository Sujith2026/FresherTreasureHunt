import apiClient from '../config/api.js';

const authService = {
    // Register a new team
    register: async (teamData) => {
        const response = await apiClient.post('/auth/register', teamData);
        // Store token and team in localStorage if present in any shape
        if (response && response.data && response.data.token && response.data.team) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('team', JSON.stringify(response.data.team));
        } else if (response && response.token && response.team) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('team', JSON.stringify(response.team));
        }
        return response;
    },

    // Login team
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        // Handle new backend structure: { success, message, data: { token, team } }
        if (response && response.data && response.data.token && response.data.team) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('team', JSON.stringify(response.data.team));
        } else if (response.token) {
            // Legacy fallback
            localStorage.setItem('token', response.token);
            localStorage.setItem('team', JSON.stringify(response.team));
        }
        return response;
    },

    // Logout team
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('team');
    },

    // Get current team from localStorage
    getCurrentTeam: () => {
        const teamData = localStorage.getItem('team');
        return teamData ? JSON.parse(teamData) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get token
    getToken: () => {
        return localStorage.getItem('token');
    },
};

export default authService;
