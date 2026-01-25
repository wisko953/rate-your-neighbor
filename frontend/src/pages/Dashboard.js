// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { dashboardService } from "../services/dashboardService";

export default function Dashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [me, setMe] = useState(null);
    const [stats, setStats] = useState(null);
    const [top3, setTop3] = useState([]);
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                // user local (si ton dashboardService.getMe() lit localStorage par ex.)
                const meRes = await dashboardService.getMe();
                setMe(meRes);

                // si pas connecté, on renvoie au login (optionnel)
                // tu peux enlever ça si tu ne veux pas forcer
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const [statsRes, top3Res, feedRes] = await Promise.all([
                    dashboardService.getMyStats(),
                    dashboardService.getTop3(),
                    dashboardService.getFeed(6),
                ]);

                setStats(statsRes);
                setTop3(top3Res || []);
                setFeed(feedRes || []);
            } catch (e) {
                console.error("Dashboard load error:", e);
                setError(
                    e?.response?.data?.error ||
                    e?.message ||
                    "Erreur lors du chargement du dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    const prettyStatus = (badge) => {
        if (!badge) return "—";
        if (badge === "BONUS_ELIGIBLE") return "🌟 Bonus eligible";
        if (badge === "COMPLIANT") return "✅ Compliant";
        if (badge === "EXPULSION_WARNING") return "⚠️ Warning";
        return badge;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Dashboard</h2>
                    <p style={styles.muted}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.headerRow}>
                <div>
                    <h2 style={styles.title}>Dashboard</h2>
                    <p style={styles.muted}>
                        Bienvenue{" "}
                        {me?.firstname ? `${me.firstname} ${me.lastname || ""}` : "👋"}
                    </p>
                </div>

                <button onClick={logout} style={styles.btnDanger}>
                    Logout
                </button>
            </div>

            {error && (
                <div style={{ ...styles.card, border: "1px solid #ffbdbd" }}>
                    <p style={{ margin: 0, color: "#b00020" }}>
                        <b>Erreur :</b> {error}
                    </p>
                    <p style={{ marginTop: 8, ...styles.muted }}>
                        Vérifie que l’API métier répond et que REACT_APP_API_METIER_URL est
                        correct.
                    </p>
                </div>
            )}

            {/* Stats */}
            <div style={styles.grid3}>
                <div style={styles.card}>
                    <p style={styles.smallLabel}>Score</p>
                    <p style={styles.bigNumber}>
                        {stats?.points !== null && stats?.points !== undefined
                            ? Number(stats.points).toFixed(2)
                            : "—"}
                    </p>
                    <p style={styles.muted}>Score actuel de ton foyer</p>
                </div>

                <div style={styles.card}>
                    <p style={styles.smallLabel}>Classement</p>
                    <p style={styles.bigNumber}>{stats?.rank ?? "—"}</p>
                    <p style={styles.muted}>Ta position dans ta résidence</p>
                </div>

                <div style={styles.card}>
                    <p style={styles.smallLabel}>Statut</p>
                    <p style={{ ...styles.bigNumber, fontSize: 22 }}>
                        {prettyStatus(stats?.badge)}
                    </p>
                    <p style={styles.muted}>
                        Occupants : {stats?.occupantCount ?? "—"}
                    </p>
                </div>
            </div>

            {/* Top 3 */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>🏆 Top 3 (résidence)</h3>

                {top3.length === 0 ? (
                    <p style={styles.muted}>Aucune donnée de leaderboard.</p>
                ) : (
                    <div style={styles.topList}>
                        {top3.map((h, idx) => (
                            <div key={h.id || idx} style={styles.topItem}>
                                <div style={styles.rankCircle}>{idx + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={styles.topName}>{h.name || "Maison"}</p>
                                    <p style={styles.muted}>
                                        Score :{" "}
                                        {h.score !== null && h.score !== undefined
                                            ? Number(h.score).toFixed(2)
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feed */}
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>📰 Activité récente</h3>

                {feed.length === 0 ? (
                    <p style={styles.muted}>Aucune activité pour l’instant.</p>
                ) : (
                    <div style={styles.feedList}>
                        {feed.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    ...styles.feedItem,
                                    border: item.highlighted
                                        ? "1px solid #b7ffcf"
                                        : "1px solid #eee",
                                }}
                            >
                                <div style={styles.feedEmoji}>{item.emoji || "•"}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={styles.feedTitle}>
                                        {item.title || "Activité"}{" "}
                                        {item.highlighted ? <span>✨</span> : null}
                                    </p>
                                    <p style={{ margin: "6px 0" }}>{item.text || ""}</p>
                                    <p style={styles.muted}>{item.meta || ""}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
    },
    title: { margin: 0 },
    sectionTitle: { marginTop: 0, marginBottom: 12 },
    muted: { color: "#666", margin: "6px 0" },
    smallLabel: { margin: 0, color: "#777", fontSize: 13 },
    bigNumber: { margin: "6px 0", fontSize: 28, fontWeight: "bold" },

    grid3: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 12,
    },

    card: {
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        marginBottom: 12,
    },

    btnDanger: {
        border: "none",
        padding: "10px 14px",
        borderRadius: 8,
        cursor: "pointer",
        background: "#c62828",
        color: "white",
        fontWeight: "bold",
    },

    topList: { display: "flex", flexDirection: "column", gap: 10 },
    topItem: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        border: "1px solid #eee",
    },
    rankCircle: {
        width: 34,
        height: 34,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        border: "1px solid #ddd",
    },
    topName: { margin: 0, fontWeight: "bold" },

    feedList: { display: "flex", flexDirection: "column", gap: 10 },
    feedItem: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 12,
        borderRadius: 8,
        background: "#fafafa",
    },
    feedEmoji: { fontSize: 22, width: 28, textAlign: "center" },
    feedTitle: { margin: 0, fontWeight: "bold" },
};