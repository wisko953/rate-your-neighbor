# rate-your-neighbor
Application de reviews de voisinage avec attribution de récompenses / pénalitées

## Configuration (IMPORTANT)

**Avant de lancer le projet**, créez les fichiers `.env` à partir des fichiers `.env.example` dans chaque dossier (racine, api-gateway, api-metier, frontend).

Ensuite, **modifiez les valeurs** dans chaque `.env` (notamment `JWT_SECRET`, `DB_PASSWORD`, etc.).

## Lancement rapide avec Docker Compose

```bash
docker-compose up -d --build
```

**Accès aux services :**
- Frontend : http://localhost:3000
- API Gateway : http://localhost:4000/api
- API Métier : http://localhost:5000/api
- phpMyAdmin : http://localhost:8080
