-- DATA FIXTURES - Rate Your Neighbor

USE rate_your_neighbor;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Nettoyage
TRUNCATE TABLE event_participants;
TRUNCATE TABLE events;
TRUNCATE TABLE reports;
TRUNCATE TABLE reviews;
TRUNCATE TABLE occupants;
TRUNCATE TABLE houses;
TRUNCATE TABLE residences;
TRUNCATE TABLE users;

-- USERS
INSERT INTO users (id, email, password_hash, role) VALUES
-- Admins
(1, 'admin@dev.com', '$2b$10$YourHashedPasswordHere', 'admin'),
-- Référents
(2, 'referent.dupont@dev.com', '$2b$10$YourHashedPasswordHere', 'referent'),
(3, 'referent.martin@dev.com', '$2b$10$YourHashedPasswordHere', 'referent'),
(4, 'referent.bernard@dev.com', '$2b$10$YourHashedPasswordHere', 'referent'),
(5, 'referent.thomas@dev.com', '$2b$10$YourHashedPasswordHere', 'referent'),
-- Utilisateurs normaux
(6, 'jean.dupuis@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(7, 'marie.claire@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(8, 'pierre.blanc@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(9, 'sophie.laurent@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(10, 'lucas.moreau@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(11, 'emma.petit@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(12, 'thomas.roux@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(13, 'julie.simon@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(14, 'kevin.michel@dev.com', '$2b$10$YourHashedPasswordHere', 'user'),
(15, 'laura.garcia@dev.com', '$2b$10$YourHashedPasswordHere', 'user');

-- RESIDENCES
INSERT INTO residences (id, name, address, city, manager_id) VALUES
(1, 'Résidence Les Jardins', '15 Avenue des Champs', 'Paris', 1),
(2, 'Résidence Le Parc', '42 Rue de la République', 'Lyon', 1),
(3, 'Résidence Bellevue', '8 Boulevard Victor Hugo', 'Marseille', 1),
(4, 'Résidence Horizon', '23 Allée des Érables', 'Toulouse', 1);

-- HOUSES
INSERT INTO houses (id, residence_id, address, referent_user_id) VALUES
-- Résidence Les Jardins (Paris)
(1, 1, 'Appartement 101', 2),
(2, 1, 'Appartement 102', 2),
(3, 1, 'Appartement 201', 3),
(4, 1, 'Appartement 202', 3),
(5, 1, 'Appartement 301', NULL),
-- Résidence Le Parc (Lyon)
(6, 2, 'Appartement A1', 4),
(7, 2, 'Appartement A2', 4),
(8, 2, 'Appartement B1', NULL),
(9, 2, 'Appartement B2', NULL),
-- Résidence Bellevue (Marseille)
(10, 3, 'Studio 1A', 5),
(11, 3, 'Studio 1B', 5),
(12, 3, 'T2 - 2A', NULL),
-- Résidence Horizon (Toulouse)
(13, 4, 'Maison 1', NULL),
(14, 4, 'Maison 2', NULL),
(15, 4, 'Maison 3', NULL);

-- OCCUPANTS
INSERT INTO occupants (id, house_id, firstname, lastname, age) VALUES
-- Appartement 101 (Famille Dupont)
(1, 1, 'Jean', 'Dupont', 42),
(2, 1, 'Marie', 'Dupont', 40),
(3, 1, 'Lucas', 'Dupont', 15),
-- Appartement 102 (Colocation)
(4, 2, 'Sophie', 'Martin', 25),
(5, 2, 'Pierre', 'Bernard', 27),
(6, 2, 'Emma', 'Petit', 24),
-- Appartement 201 (Couple)
(7, 3, 'Thomas', 'Roux', 35),
(8, 3, 'Julie', 'Roux', 33),
-- Appartement 202 (Célibataire)
(9, 4, 'Kevin', 'Michel', 29),
-- Appartement 301 (Famille nombreuse)
(10, 5, 'Laurent', 'Garcia', 45),
(11, 5, 'Laura', 'Garcia', 43),
(12, 5, 'Tom', 'Garcia', 18),
(13, 5, 'Nina', 'Garcia', 16),
-- Appartement A1 (Lyon)
(14, 6, 'Alice', 'Dubois', 31),
(15, 6, 'Marc', 'Dubois', 32),
-- Appartement A2 (Lyon)
(16, 7, 'Camille', 'Leroy', 28),
(17, 7, 'Paul', 'Moreau', 30),
-- Appartement B1 (Lyon)
(18, 8, 'Isabelle', 'Fontaine', 38),
-- Appartement B2 (Lyon)
(19, 9, 'Nicolas', 'Girard', 26),
(20, 9, 'Sarah', 'Lambert', 25),
-- Studio 1A (Marseille)
(21, 10, 'Antoine', 'Rousseau', 23),
-- Studio 1B (Marseille)
(22, 11, 'Léa', 'Vincent', 22),
-- T2 - 2A (Marseille)
(23, 12, 'Julien', 'Mercier', 34),
(24, 12, 'Claire', 'Mercier', 32),
-- Maison 1 (Toulouse)
(25, 13, 'David', 'Lefebvre', 40),
(26, 13, 'Sophie', 'Lefebvre', 38),
(27, 13, 'Léo', 'Lefebvre', 12),
-- Maison 2 (Toulouse)
(28, 14, 'Olivier', 'Blanc', 37),
(29, 14, 'Nathalie', 'Blanc', 36),
-- Maison 3 (Toulouse)
(30, 15, 'Maxime', 'Renard', 29);

-- REVIEWS
INSERT INTO reviews (submitter_user_id, author_occupant_id, target_occupant_id, context_house_id, rating, comment, is_anonymous) VALUES
(7, 4, 1, 1, 4.5, 'Voisin très sympathique et respectueux. Toujours prêt à rendre service.', FALSE),
(8, 5, 2, 1, 4.0, 'Personne agréable, mais parfois un peu de bruit le weekend.', FALSE),
(12, 7, 3, 1, 3.5, 'Jeune un peu bruyant mais poli.', FALSE),
(6, 1, 4, 2, 5.0, 'Excellente voisine, calme et respectueuse.', FALSE),
(7, 2, 5, 2, 4.0, 'Bon voisin, parfois des soirées tardives.', FALSE),
(14, 9, 6, 2, 4.5, 'Très discrète et aimable.', FALSE),
(7, 4, 7, 3, 4.5, 'Voisin exemplaire, toujours souriant.', FALSE),
(8, 5, 8, 3, 4.0, 'Très sympathique.', FALSE),
(12, 7, 9, 4, 3.0, 'Parfois bruyant en soirée, mais correct dans l\'ensemble.', TRUE),
(13, 8, 9, 4, 3.5, 'Pourrait faire un effort sur le bruit.', FALSE),
(6, 1, 10, 5, 4.5, 'Père de famille responsable et respectueux.', FALSE),
(7, 4, 11, 5, 4.0, 'Très gentille et accueillante.', FALSE),
(9, 14, 16, 7, 5.0, 'Voisine parfaite ! Calme et toujours disponible pour discuter.', FALSE),
(10, 15, 17, 7, 4.5, 'Super voisin, on organise souvent des barbecues ensemble.', FALSE),
(11, 16, 14, 6, 5.0, 'Excellente voisine, nous nous entraidons régulièrement.', FALSE),
(11, 17, 15, 6, 4.5, 'Très sympa et serviable.', FALSE),
(9, 18, 19, 9, 3.0, 'Un peu bruyant le soir, mais sinon correct.', FALSE),
(10, 19, 18, 8, 4.0, 'Voisine discrète et agréable.', FALSE),
(6, 21, 22, 11, 4.5, 'Très sympa, on s\'entraide pour les courses.', FALSE),
(7, 22, 21, 10, 4.0, 'Bon voisin, parfois un peu de musique forte.', FALSE),
(8, 23, 22, 11, 4.5, 'Jeune fille très respectueuse et polie.', FALSE),
(6, 25, 28, 14, 4.5, 'Excellent voisin, nos familles s\'entendent très bien.', FALSE),
(7, 26, 29, 14, 5.0, 'Nous sommes devenues amies ! Parfaite voisine.', FALSE),
(8, 28, 25, 13, 4.5, 'Famille très agréable, les enfants jouent ensemble.', FALSE),
(15, 30, 25, 13, 4.0, 'Voisin sympathique, toujours un mot gentil.', FALSE),
(6, 25, 30, 15, 3.5, 'Un peu bruyant avec ses soirées, mais dans l\'ensemble correct.', TRUE);

-- REPORTS
INSERT INTO reports (author_user_id, target_occupant_id, reason, description, is_processed) VALUES
(12, 9, 'bruit', 'Musique forte jusqu\'à 2h du matin le samedi dernier.', TRUE),
(7, 5, 'bruit', 'Fête bruyante un mardi soir.', TRUE),
(8, 12, 'incivilite', 'Vélo laissé dans le couloir commun.', TRUE),
(11, 19, 'bruit', 'Télévision très forte tous les soirs après 22h.', FALSE),
(9, 30, 'bruit', 'Soirées bruyantes régulières le weekend.', FALSE),
(14, 6, 'autre', 'Colis déposés devant ma porte par erreur.', FALSE);

-- EVENTS
INSERT INTO events (id, title, description, date, location, min_score_required, residence_id) VALUES
(1, 'Barbecue d\'été 2025', 'Grand barbecue convivial dans le jardin de la résidence.', '2025-07-15 18:00:00', 'Jardin commun', 3.0, 1),
(2, 'Vide-grenier', 'Vente de vêtements, livres et objets divers entre voisins.', '2025-09-20 10:00:00', 'Parking', 2.5, 2),
(3, 'Atelier jardinage', 'Apprenez à créer votre potager urbain avec nos experts.', '2025-10-05 14:00:00', 'Salle commune', 2.5, 3),
(4, 'Galette des rois 2026', 'Venez partager la galette et rencontrer vos voisins !', '2026-01-30 19:00:00', 'Salle de réception', 3.0, 1),
(5, 'Nettoyage de printemps', 'Grand nettoyage collectif des espaces communs.', '2026-03-15 09:00:00', 'Espaces communs', 2.5, 2),
(6, 'Tournoi de pétanque', 'Compétition amicale de pétanque entre résidents.', '2026-04-20 15:00:00', 'Terrain de pétanque', 3.0, 3),
(7, 'Soirée cinéma', 'Projection en plein air d\'un film familial.', '2026-05-25 21:00:00', 'Jardin', 2.5, 1),
(8, 'Fête des voisins', 'La traditionnelle fête des voisins de mai !', '2026-05-29 18:00:00', 'Cour intérieure', 2.0, 4),
(9, 'Apéro d\'été', 'Apéritif convivial pour bien commencer l\'été.', '2026-06-21 19:00:00', 'Terrasse', 3.0, 2);

-- EVENT_PARTICIPANTS
INSERT INTO event_participants (event_id, occupant_id) VALUES
(1, 1), (1, 2), (1, 4), (1, 5), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
(2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19),
(3, 21), (3, 22), (3, 23), (3, 24),
(4, 1), (4, 2), (4, 4), (4, 7), (4, 8),
(5, 14), (5, 15), (5, 16), (5, 17),
(6, 21), (6, 23), (6, 24),
(7, 1), (7, 2), (7, 3), (7, 10), (7, 11), (7, 12), (7, 13),
(8, 25), (8, 26), (8, 27), (8, 28), (8, 29), (8, 30),
(9, 14), (9, 15), (9, 16), (9, 17), (9, 19), (9, 20);

SET FOREIGN_KEY_CHECKS = 1;

-- STATISTIQUES
SELECT 'Fixtures chargées avec succès !' as Status;
SELECT COUNT(*) as 'Nombre d\'utilisateurs' FROM users;
SELECT COUNT(*) as 'Nombre de résidences' FROM residences;
SELECT COUNT(*) as 'Nombre de foyers' FROM houses;
SELECT COUNT(*) as 'Nombre d\'occupants' FROM occupants;
SELECT COUNT(*) as 'Nombre d\'avis' FROM reviews;
SELECT COUNT(*) as 'Nombre de signalements' FROM reports;
SELECT COUNT(*) as 'Nombre d\'événements' FROM events;
SELECT COUNT(*) as 'Nombre de participants' FROM event_participants;
