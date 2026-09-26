import apiClient from '../config/api.js';

const adminService = {
    // ===== ADMIN LOGIN =====
    login: async (credentials) => {
        // credentials: { username, password }
        const response = await apiClient.post('/auth/admin/login', credentials);
        // Store token in localStorage for admin session
        if (response && response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // ===== DASHBOARD =====
    getDashboard: async () => {
        return await apiClient.get('/admin/dashboard');
    },

    // ===== TEAM MANAGEMENT =====
    getAllTeams: async () => {
        return await apiClient.get('/admin/teams');
    },

    getTeamById: async (teamId) => {
        return await apiClient.get(`/admin/team/${teamId}`);
    },

    // Create a team (uses public registration endpoint under admin context)
    createTeam: async (teamData) => {
        // teamData: { teamName, password, leaderName, leaderEmail }
        return await apiClient.post('/auth/register', teamData);
    },

    updateTeam: async (teamId, updates) => {
        return await apiClient.patch(`/admin/team/${teamId}`, updates);
    },

    deleteTeam: async (teamId) => {
        return await apiClient.delete(`/admin/team/${teamId}`);
    },

    // ===== QR STAGE MANAGEMENT =====
    // Backend routes: /api/admin/qr [GET, POST], /api/admin/qr/:id [PATCH, DELETE]
    getAllQRStages: async () => {
        return await apiClient.get('/admin/qr');
    },

    // Convenience alias used in components
    getQRStages: async () => {
        return await apiClient.get('/admin/qr');
    },

    createQRStage: async (stageData) => {
        return await apiClient.post('/admin/qr', stageData);
    },

    updateQRStage: async (stageId, updates) => {
        return await apiClient.patch(`/admin/qr/${stageId}`, updates);
    },

    deleteQRStage: async (stageId) => {
        return await apiClient.delete(`/admin/qr/${stageId}`);
    },

    // ===== SCAN LOGS =====
    getAllScanLogs: async () => {
        return await apiClient.get('/admin/scans');
    },

    // ===== HINT MANAGEMENT (NEW) =====

    // Get all hints
    getAllHints: async () => {
        return await apiClient.get('/admin/hints');
    },

    // Create a new hint
    createHint: async (hintData) => {
        // hintData: { hintId, text, qrId, points, hintType, difficulty }
        return await apiClient.post('/admin/hints', hintData);
    },

    // Update a hint
    updateHint: async (hintId, updates) => {
        return await apiClient.patch(`/admin/hints/${hintId}`, updates);
    },

    // Delete a hint
    deleteHint: async (hintId) => {
        return await apiClient.delete(`/admin/hints/${hintId}`);
    },

    // Get single hint by ID
    getHintById: async (hintId) => {
        return await apiClient.get(`/admin/hints/${hintId}`);
    },

    // ===== QR CODE IMAGE MANAGEMENT (NEW) =====

    // Get all QR codes with images for display
    getQRCodesWithImages: async () => {
        return await apiClient.get('/admin/qr-images');
    },

    // Regenerate QR code image
    regenerateQRCode: async (qrId) => {
        return await apiClient.post(`/admin/qr/${qrId}/regenerate`);
    },

    // Download QR code as PNG (returns blob)
    downloadQRCode: async (qrId, qrCode) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiClient.defaults.baseURL}/admin/qr/${qrId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download QR code');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${qrCode}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // ===== EVENT MANAGEMENT =====
    resetEvent: async () => {
        return await apiClient.post('/admin/reset');
    },

    // ===== EVENT CONTROL (NEW) =====

    // Get event settings
    getEventSettings: async () => {
        return await apiClient.get('/admin/event/settings');
    },

    // Start the event
    startEvent: async (adminName = 'admin') => {
        return await apiClient.post('/admin/event/start', { adminName });
    },

    // End the event
    endEvent: async (adminName = 'admin') => {
        return await apiClient.post('/admin/event/end', { adminName });
    },

    // Update event settings
    updateEventSettings: async (settings) => {
        return await apiClient.patch('/admin/event/settings', settings);
    },

    // ===== TEAM ELIMINATION (NEW) =====

    // Eliminate a team
    eliminateTeam: async (teamId) => {
        return await apiClient.post(`/admin/team/${teamId}/eliminate`);
    },

    // Reactivate an eliminated team
    reactivateTeam: async (teamId) => {
        return await apiClient.post(`/admin/team/${teamId}/reactivate`);
    },

    // ===== REJOIN QR MANAGEMENT (NEW) =====

    // Get all rejoin QR codes
    getAllRejoinQRs: async () => {
        return await apiClient.get('/admin/rejoin-qr');
    },

    // Create a new rejoin QR
    createRejoinQR: async (rejoinQRData) => {
        // rejoinQRData: { code, name, description, maxUsageCount, expiresAt, pointsAdjustment, createdBy }
        return await apiClient.post('/admin/rejoin-qr', rejoinQRData);
    },

    // Update a rejoin QR
    updateRejoinQR: async (rejoinQRId, updates) => {
        return await apiClient.patch(`/admin/rejoin-qr/${rejoinQRId}`, updates);
    },

    // Delete a rejoin QR
    deleteRejoinQR: async (rejoinQRId) => {
        return await apiClient.delete(`/admin/rejoin-qr/${rejoinQRId}`);
    },

    // Get single rejoin QR by ID
    getRejoinQRById: async (rejoinQRId) => {
        return await apiClient.get(`/admin/rejoin-qr/${rejoinQRId}`);
    },
};

export default adminService;
