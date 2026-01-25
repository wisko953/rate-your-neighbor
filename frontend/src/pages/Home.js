import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    // ===== Toasts (équivalent #toast-container + .toast) =====
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const showToast = (text) => {
        const id = ++toastId.current;
        setToasts((prev) => [...prev, { id, text }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    // ===== Compliments (comme app.js) =====
    const compliments = useMemo(
        () => [
            "Ton jardin est si beau qu'on dirait un niveau dans Animal Crossing. 🌸",
            "Merci de ne pas utiliser ta perceuse avant 10h, tu es un saint. 🙌",
            "Tes décorations d'Halloween font peur, mais on adore l'effort ! 🎃",
            "La façon dont tu replies tes cartons au local poubelle est érotique. 📦",
            "Merci d'avoir récupéré mon colis Amazon, t'es le meilleur voisin du monde. 🚚",
            "Tes enfants font du bruit, mais ils sont mignons, alors ça va. 👶",
            "Ton barbecue sentait tellement bon qu'on a failli s'inviter. 🥩",
            "Merci de ne pas laisser traîner tes déchets, t'es un héros écolo. ♻️",
            "Merci pour ta patience pendant les travaux, t'es un vrai champion. 🏆",
            "Merci pour le gâteau que tu as partagé l'autre jour, tu devrais ouvrir une pâtisserie ! 🍰",
            "Merci de toujours arroser les plantes communes, tu es un vrai jardinier. 🌿",
            "Tes talents de DJ lors des fêtes de quartier sont légendaires ! 🎧",
            "Merci pour ton aide avec les déménagements, t'es un super voisin musclé ! 💪",
        ],
        []
    );

    const [compliment, setCompliment] = useState('"Clique sur le bouton pour voir..."');
    const [compFade, setCompFade] = useState(true);
    const complimentBtnRef = useRef(null);

    // ===== Emoji burst (même effet que app.js, en DOM) =====
    const createEmojiBurst = (element) => {
        if (!element) return;
        const emojis = ["❤️", "✨", "🏡", "🌈", "🔥"];
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < 10; i++) {
            const span = document.createElement("span");
            span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            span.style.position = "fixed";
            span.style.left = rect.left + rect.width / 2 + "px";
            span.style.top = rect.top + "px";
            span.style.fontSize = "20px";
            span.style.pointerEvents = "none";
            span.style.zIndex = "9999";
            document.body.appendChild(span);

            const x = (Math.random() - 0.5) * 200;
            const y = -Math.random() * 150;

            span
                .animate(
                    [
                        { transform: "translate(0, 0) scale(1)", opacity: 1 },
                        { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 },
                    ],
                    { duration: 1000, easing: "ease-out" }
                )
                .onfinish = () => span.remove();
        }
    };

    const handleLoginTrigger = (targetPath = "/login") => {
        showToast("🚀 Préparation de l'entrée au village...");
        setTimeout(() => {
            showToast("Vérification que vous n'êtes pas un démarcheur...");
        }, 1000);

        // Option “sympa” : redirige après un mini délai
        setTimeout(() => navigate(targetPath), 1400);
    };

    const handleDiscover = () => {
        const el = document.getElementById("features-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const handleGenerateCompliment = () => {
        const random = compliments[Math.floor(Math.random() * compliments.length)];
        setCompFade(false);
        setTimeout(() => {
            setCompliment(`"${random}"`);
            setCompFade(true);
            createEmojiBurst(complimentBtnRef.current);
        }, 200);
    };

    return (
        <>
            {/* ===== Navbar (comme index.html) ===== */}
            <header className="navbar">
                <div className="container nav-content">
                    <div className="logo-area">
                        <div className="logo-icon">🏡</div>
                        <div>
                            <h1 className="logo">Rate Your Neighbour</h1>
                            <span className="badge-private">Accès Résidents Uniquement</span>
                        </div>
                    </div>

                    {/* On garde le look "btn-login-trigger", mais en React */}
                    <button
                        className="btn btn-primary btn-login-trigger"
                        onClick={() => handleLoginTrigger("/login")}
                        type="button"
                    >
                        Connexion
                    </button>
                </div>
            </header>

            <main>
                {/* ===== Hero ===== */}
                <section className="hero">
                    <div className="container hero-grid">
                        <div className="hero-text">
                            <div className="status-pill">● 42 voisins en ligne</div>
                            <h2 className="hero-title">
                                La vie de quartier, en version <span className="highlight">Géniale.</span>
                            </h2>
                            <p className="hero-subtitle">
                                Parce qu'un voisin qui prête sa tondeuse mérite 5 étoiles, et celui qui fait un BBQ à 2h du mat...
                                un petit rappel.
                            </p>

                            <div className="hero-btns">
                                <button
                                    className="btn btn-primary btn-lg btn-login-trigger"
                                    onClick={() => handleLoginTrigger("/register")}
                                    type="button"
                                >
                                    Rejoindre le quartier
                                </button>

                                <button className="btn btn-secondary btn-lg" id="btn-discover" onClick={handleDiscover} type="button">
                                    Voir l'ambiance
                                </button>
                            </div>

                            {/* Bonus: liens “propres” si tu veux aussi les afficher (facultatif) */}
                            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <Link className="btn btn-primary" to="/register">Créer un compte</Link>
                                <Link className="btn btn-accent" to="/login">Se connecter</Link>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="floating-elements">
                                <div className="float-card bubble-1">"Merci pour les œufs ! 🍳"</div>
                                <div className="float-card bubble-2">"Musique trop forte au N°4... 🤫"</div>
                                <div className="float-card bubble-3">⭐⭐⭐⭐⭐</div>
                            </div>

                            <svg viewBox="0 0 500 400" className="residence-svg">
                                <path d="M0,400 Q150,320 300,380 T500,350 L500,400 L0,400 Z" fill="#81c784" />
                                <g className="house house-1">
                                    <rect x="180" y="280" width="70" height="70" rx="5" fill="#A1887F" />
                                    <path d="M170,280 L215,230 L260,280 Z" fill="#5D4037" />
                                    <rect x="205" y="315" width="20" height="35" fill="#FFECB3" />
                                    <circle cx="235" cy="300" r="8" fill="#FFF" opacity="0.5" />
                                </g>
                                <g className="sun">
                                    <circle cx="420" cy="80" r="35" fill="#FFD54F" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </section>

                {/* ===== Feed (id=features-section pour scroll smooth) ===== */}
                <section className="social-feed" id="features-section">
                    <div className="container">
                        <h3 className="section-title">Dernières activités au quartier 💬</h3>

                        <div className="feed-container">
                            <div className="feed-item">
                                <div className="avatar">👴</div>
                                <div className="feed-content">
                                    <strong>M. Bernard (Maison 12)</strong>
                                    <p>
                                        "A encore tondu sa pelouse à 7h un dimanche. Mais il nous a offert des tomates du jardin après,
                                        alors on pardonne."
                                    </p>
                                    <div className="feed-meta">
                                        <span>⭐ 3/5</span> • <span>Il y a 2h</span>
                                    </div>
                                </div>
                            </div>

                            <div className="feed-item highlighted">
                                <div className="avatar">👩‍🍳</div>
                                <div className="feed-content">
                                    <strong>Léa (Maison 5)</strong>
                                    <p>"A partagé ses cookies chocolat-noisette avec toute l'allée. Une légende vivante !"</p>
                                    <div className="feed-meta">
                                        <span>⭐ 5/5 + Badge Cookie-Master</span> • <span>Il y a 5h</span>
                                    </div>
                                </div>
                            </div>

                            <div className="feed-item">
                                <div className="avatar">🎧</div>
                                <div className="feed-content">
                                    <strong>Julien (Maison 22)</strong>
                                    <p>"A fait une fête techno hier. On a aimé la playlist, moins les basses dans le salon à minuit."</p>
                                    <div className="feed-meta">
                                        <span>⭐ 2/5</span> • <span>Hier</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Leaderboard ===== */}
                <section className="leaderboard">
                    <div className="container">
                        <div className="glass-card">
                            <h3>Le Top 3 des voisins modèles 🏆</h3>
                            <div className="ranking-list">
                                <div className="rank-item">
                                    <span className="rank-num">1</span>
                                    <span className="rank-name">Famille Martin</span>
                                    <div className="rank-bar" style={{ width: "95%" }} />
                                    <span className="rank-score">4.9</span>
                                </div>

                                <div className="rank-item">
                                    <span className="rank-num">2</span>
                                    <span className="rank-name">Mme Douce</span>
                                    <div className="rank-bar" style={{ width: "88%" }} />
                                    <span className="rank-score">4.7</span>
                                </div>

                                <div className="rank-item">
                                    <span className="rank-num">3</span>
                                    <span className="rank-name">Thomas &amp; Chloé</span>
                                    <div className="rank-bar" style={{ width: "82%" }} />
                                    <span className="rank-score">4.5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Fun tool (compliments) ===== */}
                <section className="fun-tool">
                    <div className="container">
                        <div className="tool-box">
                            <h4>Besoin de remonter la note d'un voisin ?</h4>
                            <p>Génère un compliment automatique pour son profil :</p>

                            <div
                                id="compliment-display"
                                className="compliment-text"
                                style={{ opacity: compFade ? 1 : 0, transition: "opacity 0.2s ease" }}
                            >
                                {compliment}
                            </div>

                            <button
                                ref={complimentBtnRef}
                                className="btn btn-accent"
                                id="gen-compliment"
                                onClick={handleGenerateCompliment}
                                type="button"
                            >
                                Générer une gentillesse 🌈
                            </button>
                        </div>
                    </div>
                </section>

                <br />
            </main>

            {/* ===== Footer ===== */}
            <footer className="footer">
                <div className="container">
                    <p>
                        <strong>Rate Your Neighbour</strong> - Plus qu'une appli, une famille (parfois bruyante).
                    </p>
                    <p className="muted">Accès strictement réservé aux porteurs du badge de la résidence.</p>
                </div>
            </footer>

            {/* ===== Toast container ===== */}
            <div id="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className="toast">
                        {t.text}
                    </div>
                ))}
            </div>
        </>
    );
}