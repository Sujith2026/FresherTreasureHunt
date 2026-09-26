import apiClient from '../config/api.js';

const scanService = {
    // ===== NEW GAME FLOW =====

    // Start the treasure hunt game
    startGame: async (qrId = 'START') => {
        return await apiClient.post('/game/start', { qrId });
    },

    // Scan a QR code in the new game flow
    scanQRNew: async (qrId) => {
        return await apiClient.post('/game/scan', { qrId });
    },

    // Get hint logs (complete history)
    getGameLogs: async () => {
        return await apiClient.get('/game/logs');
    },

    // Get current active hint
    getCurrentHint: async () => {
        return await apiClient.get('/game/current-hint');
    },

    // Scan rejoin QR to rejoin after elimination
    scanRejoinQR: async (qrId) => {
        return await apiClient.post('/game/rejoin', { qrId });
    },

    // ===== OLD ENDPOINTS (Deprecated but kept for backward compatibility) =====

    // Scan a QR code (old flow)
    scanQR: async (qrCode) => {
        return await apiClient.post('/scan', { qrCode });
    },

    // Get scan statistics
    getStats: async () => {
        return await apiClient.get('/scan/stats');
    },
};

export default scanService;
