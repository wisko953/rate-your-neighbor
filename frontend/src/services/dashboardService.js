// frontend/src/services/dashboardService.js
import { apiMetier } from "./api";

// Petit helper: récupérer l'utilisateur stocké après login
function getLocalUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

export const dashboardService = {
    /**
     * Ici, "me" vient du localStorage (car l'API métier n'a pas /me).
     * Le vrai backend d'auth est dans api-gateway.
     */
    async getMe() {
        return getLocalUser();
    },

    /**
     * Trouver le "contexte" du user : son house + sa résidence.
     * Convention actuelle côté DB: houses.referent_user_id = users.id
     */
    async getMyContext() {
        const user = getLocalUser();
        if (!user?.id) return { user, house: null, residenceId: null };

        const housesRes = await apiMetier.get("/houses");
        const houses = housesRes.data || [];

        // On prend la maison dont le user est référent, sinon fallback sur la 1ère
        const myHouse = houses.find((h) => h.referent_user_id === user.id) || houses[0] || null;

        return {
            user,
            house: myHouse,
            residenceId: myHouse?.residence_id ?? null,
        };
    },

    /**
     * Stats du dashboard: on s'appuie sur GET /houses/:id (retourne score + status)
     * + on peut récupérer le rank via leaderboard
     */
    async getMyStats() {
        const { house, residenceId } = await this.getMyContext();
        if (!house?.id) return null;

        const houseDetail = (await apiMetier.get(`/houses/${house.id}`)).data;

        let rank = null;
        if (residenceId) {
            const lb = (await apiMetier.get(`/residences/${residenceId}/leaderboard`)).data || [];
            const me = lb.find((x) => Number(x.id) === Number(house.id));
            rank = me?.ranking ?? null;
        }

        // Mapping "dashboard-friendly"
        return {
            points: houseDetail?.currentScore,       // ex: 4.6
            rank,                                    // ex: 2
            badge: houseDetail?.status,              // COMPLIANT / BONUS_ELIGIBLE / EXPULSION_WARNING
            occupantCount: houseDetail?.occupantCount
        };
    },

    /**
     * Top 3 du quartier = leaderboard de la résidence
     */
    async getTop3() {
        const { residenceId } = await this.getMyContext();
        if (!residenceId) return [];

        const lb = (await apiMetier.get(`/residences/${residenceId}/leaderboard`)).data || [];
        return lb.slice(0, 3).map((h) => ({
            id: h.id,
            name: h.address,
            score: h.score,
            bar: 95, // le Dashboard.js sait déjà recalculer si besoin
            ranking: h.ranking,
        }));
    },

    /**
     * Feed: on peut agréger reviews + events et trier par date
     */
    async getFeed(limit = 5) {
        const { house, residenceId } = await this.getMyContext();

        const [reviewsRes, eventsRes] = await Promise.all([
            apiMetier.get("/reviews"),
            apiMetier.get("/events"),
        ]);

        const reviews = reviewsRes.data || [];
        const events = eventsRes.data || [];

        const feedReviews = reviews
            .filter((r) => !house?.id || Number(r.context_house_id) === Number(house.id))
            .map((r) => ({
                id: `review-${r.id}`,
                emoji: "⭐",
                title: "Nouvelle review",
                text: r.comment || "Avis laissé",
                meta: `${r.rating}/5 • ${r.created_at}`,
                createdAt: r.created_at,
                highlighted: Number(r.rating) >= 4.5,
            }));

        const feedEvents = events
            .filter((e) => !residenceId || Number(e.residence_id) === Number(residenceId))
            .map((e) => ({
                id: `event-${e.id}`,
                emoji: "📅",
                title: "Événement",
                text: e.title,
                meta: `${e.date || "Date à venir"} • ${e.location || "Résidence"}`,
                createdAt: e.updated_at || e.created_at,
                highlighted: false,
            }));

        // Tri du plus récent au plus vieux
        const merged = [...feedReviews, ...feedEvents].sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
        });

        return merged.slice(0, limit);
    },
};