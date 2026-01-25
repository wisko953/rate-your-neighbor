import { apiMetier } from "./api";

/**
 * ⚠️ IMPORTANT
 * Les endpoints ci-dessous sont des "valeurs probables".
 * Si tes camarades ont d'autres routes, tu changes juste les strings ici.
 */
export const dashboardService = {
    async getMe() {
        // ex: GET /me
        const res = await apiMetier.get("/me");
        return res.data;
    },

    async getMyStats() {
        // ex: GET /me/stats
        const res = await apiMetier.get("/me/stats");
        return res.data;
    },

    async getFeed(limit = 5) {
        // ex: GET /feed?limit=5
        const res = await apiMetier.get(`/feed?limit=${limit}`);
        return res.data;
    },

    async getTop3() {
        // ex: GET /leaderboard?limit=3
        const res = await apiMetier.get("/leaderboard?limit=3");
        return res.data;
    },
};