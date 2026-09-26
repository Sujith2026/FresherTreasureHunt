/**
 * Simple in-memory lock system for preventing race conditions
 * In production, consider using Redis for distributed locks
 */

class LockHelper {
    constructor() {
        this.locks = new Map();
    }

    /**
     * Acquire a lock for a specific key
     * @param {String} key - Lock key (e.g., 'team:123')
     * @param {Number} ttl - Time to live in milliseconds (default: 5000)
     * @returns {Boolean} - True if lock acquired, false otherwise
     */
    async acquire(key, ttl = 5000) {
        const now = Date.now();
        const lockData = this.locks.get(key);

        // Check if lock exists and is still valid
        if (lockData && lockData.expiresAt > now) {
            return false; // Lock is held by another process
        }

        // Acquire lock
        this.locks.set(key, {
            acquiredAt: now,
            expiresAt: now + ttl,
        });

        return true;
    }

    /**
     * Release a lock for a specific key
     * @param {String} key - Lock key
     */
    release(key) {
        this.locks.delete(key);
    }

    /**
     * Execute a function with lock protection
     * @param {String} key - Lock key
     * @param {Function} fn - Async function to execute
     * @param {Number} ttl - Lock TTL in milliseconds
     * @param {Number} maxRetries - Max retry attempts
     * @returns {Promise<any>} - Result of the function
     */
    async withLock(key, fn, ttl = 5000, maxRetries = 3) {
        let retries = 0;

        while (retries < maxRetries) {
            const acquired = await this.acquire(key, ttl);

            if (acquired) {
                try {
                    const result = await fn();
                    return result;
                } finally {
                    this.release(key);
                }
            }

            // Wait before retrying
            await this.sleep(100 * (retries + 1));
            retries++;
        }

        throw new Error(`Failed to acquire lock for ${key} after ${maxRetries} attempts`);
    }

    /**
     * Sleep helper
     * @param {Number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Clean up expired locks
     */
    cleanup() {
        const now = Date.now();
        for (const [key, lockData] of this.locks.entries()) {
            if (lockData.expiresAt <= now) {
                this.locks.delete(key);
            }
        }
    }

    /**
     * Get lock status
     * @param {String} key - Lock key
     * @returns {Object|null} - Lock data or null
     */
    getStatus(key) {
        const lockData = this.locks.get(key);
        if (!lockData) return null;

        const now = Date.now();
        return {
            isLocked: lockData.expiresAt > now,
            acquiredAt: lockData.acquiredAt,
            expiresAt: lockData.expiresAt,
            remainingMs: Math.max(0, lockData.expiresAt - now),
        };
    }
}

// Create singleton instance
const lockHelper = new LockHelper();

// Cleanup expired locks every minute
setInterval(() => {
    lockHelper.cleanup();
}, 60000);

module.exports = lockHelper;
