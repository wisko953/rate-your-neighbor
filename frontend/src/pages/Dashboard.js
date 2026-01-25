import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../auth/services/authService";
import { dashboardService } from "../services/dashboardService";

export default function Dashboard() {
    const navigate = useNavigate();

    const fallbackUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [stats, setStats] = useState(null);
    const [feed, setFeed] = useState([]);
    const [top3, setTop3] = useState([]);

    const [warning, setWarning] = useState(""); // message si back partiel

    const mockFeed = useMemo(
        () => [
            {
                id: "m1",
                emoji: "🍪",
                title: "Badge du jour",
                text: "“Cookie friendly” — parce que tu as rejoint le quartier.",
                meta: "+10 points • Aujourd’hui",
                highlighted: true,
            },
            {
                id: "m2",
                emoji: "🌿",
                title: "Conseil du syndic",
                text: "“Un petit bonjour dans l’ascenseur = +1 karma.”",
                meta: "Info • Cette semaine",
            },
            {
                id: "m3",
                emoji: "⭐",
                title: "Objectif",
                text: "Laisse ta première review pour débloquer “Voisin actif”.",
                meta: "Quête • À faire",
            },
        ],
        []
    );

    useEffect(() => {
        // ✅ protection: si pas loggé → login
        if (!authService.isAuthenticated()) {
            navigate("/login", { replace: true });
            return;
        }

        const run = async () => {
            setLoading(true);
            setWarning("");

            // On essaye tout, mais on accepte que certaines routes n'existent pas
            const results = await Promise.allSettled([
                dashboardService.getMe(),
                dashboardService.getMyStats(),
                dashboardService.getFeed(5),
                dashboardService.getTop3(),
            ]);

            const [meRes, statsRes, feedRes, top3Res] = results;

            // ME
            if (meRes.status === "fulfilled") setMe(meRes.value);
            else setMe(fallbackUser);

            // STATS
            if (statsRes.status === "fulfilled") setStats(statsRes.value);
            else setStats(null);

            // FEED
            if (feedRes.status === "fulfilled") {
                const data = feedRes.value;
                // On accepte 2 formats: tableau direct, ou {items:[...]}
                const items = Array.isArray(data) ? data : data?.items;
                setFeed(Array.isArray(items) ? items : []);
            } else {
                setFeed([]);
            }

            // TOP3
            if (top3Res.status === "fulfilled") {
                const data = top3Res.value;
                const items = Array.isArray(data) ? data : data?.items;
                setTop3(Array.isArray(items) ? items : []);
            } else {
                setTop3([]);
            }

            // Si aucune donnée métier n’est revenue, on met un warning + mock
            const anyMetierOk =
                statsRes.status === "fulfilled" ||
                feedRes.status === "fulfilled" ||
                top3Res.status === "fulfilled";

            if (!anyMetierOk) {
                setWarning(
                    "Le dashboard s’affiche, mais l’API métier ne renvoie pas encore les données (endpoints différents ou service non dispo)."
                );
            }

            setLoading(false);
        };

        run();
    }, [navigate, fallbackUser]);

    const handleLogout = () => {
        authService.logout();
        navigate("/", { replace: true });
    };

    // helpers d’affichage tolérant
    const displayName = me?.name || me?.username || me?.email || fallbackUser?.email || "voisin";

    // Stats “tolérantes” (selon ce que renvoie le back)
    const points = stats?.points ?? stats?.score ?? stats?.karma ?? null;
    const rank = stats?.rank ?? stats?.position ?? null;
    const badge = stats?.badge ?? stats?.title ?? null;

    // Feed “tolérant” : on essaie de mapper plusieurs formats possibles
    const normalizedFeed = useMemo(() => {
        if (feed && feed.length) {
            return feed.slice(0, 5).map((it, idx) => ({
                id: it.id ?? it._id ?? `f${idx}`,
                emoji: it.emoji ?? it.icon ?? "💬",
                title: it.title ?? it.type ?? "Activité",
                text: it.text ?? it.message ?? it.comment ?? JSON.stringify(it),
                meta:
                    it.meta ??
                    it.createdAt ??
                    it.date ??
                    (it.rating ? `⭐ ${it.rating}/5` : "Récemment"),
                highlighted: Boolean(it.highlighted),
            }));
        }
        return mockFeed;
    }, [feed, mockFeed]);

    const top3Normalized = useMemo(() => {
        if (top3 && top3.length) {
            return top3.slice(0, 3).map((u, idx) => ({
                id: u.id ?? u._id ?? `t${idx}`,
                name: u.name ?? u.username ?? u.email ?? `Voisin ${idx + 1}`,
                score: u.score ?? u.points ?? u.rating ?? u.karma ?? "",
                // une “largeur” de barre approximative
                bar: u.bar ?? Math.max(60, 95 - idx * 8),
            }));
        }
        return [
            { id: "t1", name: "Famille Martin", score: "4.9", bar: 95 },
            { id: "t2", name: "Mme Douce", score: "4.7", bar: 88 },
            { id: "t3", name: "Thomas & Chloé", score: "4.5", bar: 82 },
        ];
    }, [top3]);

    return (
        <>
            <header className="navbar">
                <div className="container nav-content">
                    <div className="logo-area">
                        <div className="logo-icon">🏡</div>
                        <div>
                            <h1 className="logo">Rate Your Neighbour</h1>
                            <span className="badge-private">Espace Résident</span>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleLogout} type="button">
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="hero" style={{ paddingTop: 40 }}>
                <div className="container">
                    <div className="glass-card">
                        <span className="status-pill">{loading ? "⏳ Chargement..." : "● Connecté"}</span>

                        <h2 className="hero-title" style={{ marginTop: 10 }}>
                            Bienvenue <span className="highlight">{displayName}</span>
                        </h2>

                        <p className="hero-subtitle">
                            {badge ? `Badge: ${badge}. ` : ""}
                            {points != null ? `Points: ${points}. ` : ""}
                            {rank != null ? `Rang: #${rank}. ` : ""}
                            {points == null && rank == null && !badge ? "Ton quartier t’attend 😄" : ""}
                        </p>

                        {warning && (
                            <div className="feed-item highlighted" style={{ marginTop: 14 }}>
                                <div className="avatar">⚠️</div>
                                <div className="feed-content">
                                    <strong>Info</strong>
                                    <p>{warning}</p>
                                    <div className="feed-meta">
                                        Astuce: vérifie les routes de l’API métier dans dashboardService.js
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                            <Link className="btn btn-primary" to="/">
                                Accueil
                            </Link>
                            <Link className="btn btn-accent" to="/neighbors">
                                Voir les voisins
                            </Link>
                            <Link className="btn btn-secondary" to="/reviews/new">
                                Noter un voisin
                            </Link>
                            <Link className="btn btn-secondary" to="/my-reviews">
                                Mes reviews
                            </Link>
                        </div>
                    </div>

                    <div style={{ height: 20 }} />

                    <section className="social-feed">
                        <div className="container" style={{ padding: 0 }}>
                            <h3 className="section-title">Activité récente 💬</h3>

                            <div className="feed-container">
                                {normalizedFeed.map((it) => (
                                    <div key={it.id} className={`feed-item ${it.highlighted ? "highlighted" : ""}`}>
                                        <div className="avatar">{it.emoji}</div>
                                        <div className="feed-content">
                                            <strong>{it.title}</strong>
                                            <p>{it.text}</p>
                                            <div className="feed-meta">{it.meta}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div style={{ height: 20 }} />

                    <section className="leaderboard">
                        <div className="container" style={{ padding: 0 }}>
                            <div className="glass-card">
                                <h3>Top 3 du quartier 🏆</h3>
                                <div className="ranking-list">
                                    {top3Normalized.map((u, idx) => (
                                        <div className="rank-item" key={u.id}>
                                            <span className="rank-num">{idx + 1}</span>
                                            <span className="rank-name">{u.name}</span>
                                            <div className="rank-bar" style={{ width: `${u.bar}%` }} />
                                            <span className="rank-score">{u.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p className="muted">Tu es dans le club. Sois gentil 😄</p>
                </div>
            </footer>
        </>
    );
}