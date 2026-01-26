# 🏘️ Rate Your Neighbor

Application web de notation de voisinage permettant aux résidents d'évaluer leurs voisins, de signaler des incidents et de participer à des événements communautaires.

### 📁 Structure des dossiers

```
rate-your-neighbor/
│
├── 📁 api-login/                # Authentification & routing
│   ├── config/                  # Configuration BDD
│   ├── routes/                  # Routes auth
│   ├── Dockerfile
│   └── server.js
│
├── 📁 api-metier/               # API métier
│   ├── config/                  # Configuration BDD
│   ├── models/                  # Classes métier
│   ├── routes/                  # Routes CRUD
│   ├── __tests__/               # Tests Jest
│   ├── Dockerfile
│   └── server.js
│
├── 📁 frontend/                 # Application React
│   ├── src/
│   │   ├── auth/                # Composants auth
│   │   ├── metier/              # Services métier
│   │   └── services/            # Config Axios
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Orchestration Docker
├── init.sql                     # Schéma de la BDD
├── fixtures.sql                 # Données de test
├── load-fixtures.ps1            # Script de chargement
└── .env                         # Variables d'environnement
```

---

## ⚙️ Installation et configuration

### Étape 1 : Cloner le projet

```bash
git clone <url-du-repo>
cd rate-your-neighbor
```

### Étape 2 : Créer les fichiers .env

**Vous devez créer les fichiers `.env` dans 4 emplacements** :

#### 1️⃣ À la racine du projet : `.env`

```env
# Base de données MySQL
DB_NAME=rate_your_neighbor
DB_USER=user
DB_PASSWORD=userpassword
DB_ROOT_PASSWORD=rootpassword
DB_PORT=3306

# Sécurité JWT (changez cette valeur !)
JWT_SECRET=votre_secret_super_securise_a_changer_123456789
```

#### 2️⃣ Dans `api-login/.env`

```env
PORT=4000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rate_your_neighbor
DB_USER=user
DB_PASSWORD=userpassword
JWT_SECRET=votre_secret_super_securise_a_changer_123456789
API_METIER_URL=http://api-metier:5000
```

#### 3️⃣ Dans `api-metier/.env`

```env
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=rate_your_neighbor
DB_USER=user
DB_PASSWORD=userpassword
JWT_SECRET=votre_secret_super_securise_a_changer_123456789
```

#### 4️⃣ Dans `frontend/.env`

```env
REACT_APP_API_GATEWAY_URL=http://localhost:4000/api
REACT_APP_API_METIER_URL=http://localhost:5000/api
```

> ⚠️ **IMPORTANT** : 
> - Modifiez `JWT_SECRET` avec la **même valeur** dans les 3 fichiers (racine, api-login, api-metier)
> - Modifiez `DB_PASSWORD` et `DB_ROOT_PASSWORD` si nécessaire

## 🚀 Lancement de l'application

### Démarrer tous les conteneurs

```bash
docker-compose up
```
## 🌐 Accès aux services

Une fois les conteneurs démarrés :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **API Login** | http://localhost:4000/api | API d'authentification |
| **API Métier** | http://localhost:5000/api | API métier (CRUD) |
| **Swagger Docs** | http://localhost:5000/api-docs | Documentation API |
| **phpMyAdmin** | http://localhost:8080 | Administration BDD |

## 🎲 Données de test (Fixtures)

### Charger les fixtures

Pour remplir la base de données avec des données de démonstration :

```bash
.\load-fixtures.ps1
```

### Contenu des fixtures

✅ **15 utilisateurs** (1 admin, 4 référents, 10 users)
- Admin : `admin@dev.com`
- Référents : `referent.dupont@dev.com`, etc.
- Users : `jean.dupuis@dev.com`, etc.

✅ **4 résidences** dans différentes villes
- Les Jardins (Paris)
- Le Parc (Lyon)
- Bellevue (Marseille)
- Horizon (Toulouse)

✅ **15 foyers** avec **30 occupants**
- Familles, couples, colocations, célibataires

✅ **26 avis** avec notes variées (3.0 à 5.0)

✅ **6 signalements** (bruit, incivilités, etc.)

✅ **9 événements** (passés et à venir)

✅ **50 participations** aux événements

> 💡 **Note** : Les mots de passe des utilisateurs de test sont hashés avec bcrypt. Pour tester, créez un nouveau compte via l'interface.

---

### Tests

```bash
# Lancer les tests de l'API Métier
docker-compose exec api-metier npm test
```

---

