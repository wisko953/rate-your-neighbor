document.addEventListener('DOMContentLoaded', () => {

    // 1. Générateur de compliments
    const compliments = [
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
        "Merci de toujours arroser les plantes communes, tu es un vrai jardinier . 🌿",
        "Tes talents de DJ lors des fêtes de quartier sont légendaires ! 🎧",
        "Merci pour ton aide avec les déménagements, t'es un super voisin musclé ! 💪"
    ];

    const btnComp = document.getElementById('gen-compliment');
    const displayComp = document.getElementById('compliment-display');

    btnComp.addEventListener('click', () => {
        const randomComp = compliments[Math.floor(Math.random() * compliments.length)];
        displayComp.style.opacity = 0;
        setTimeout(() => {
            displayComp.innerText = `"${randomComp}"`;
            displayComp.style.opacity = 1;
            createEmojiBurst(btnComp);
        }, 200);
    });

    // 2. Bouton Login et effets
    const loginBtns = document.querySelectorAll('.btn-login-trigger');
    loginBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast("🚀 Préparation de l'entrée au village...");
            setTimeout(() => {
                showToast("Vérification que vous n'êtes pas un démarcheur...");
            }, 1000);
        });
    });

    function showToast(text) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = text;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // 3. Animation d'éclat d'emojis
    function createEmojiBurst(element) {
        const emojis = ['❤️', '✨', '🏡', '🌈', '🔥'];
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            const span = document.createElement('span');
            span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            span.style.position = 'fixed';
            span.style.left = (rect.left + rect.width / 2) + 'px';
            span.style.top = rect.top + 'px';
            span.style.fontSize = '20px';
            span.style.pointerEvents = 'none';
            document.body.appendChild(span);

            span.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${(Math.random() - 0.5) * 200}px, ${-Math.random() * 150}px) scale(0)`, opacity: 0 }
            ], { duration: 1000, easing: 'ease-out' }).onfinish = () => span.remove();
        }
    }

    // 4. Scroll Smooth
    document.getElementById('btn-discover').addEventListener('click', () => {
        document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
    });
});
