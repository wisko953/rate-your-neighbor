-- Initialisation de la base de données Rate Your Neighbor

CREATE DATABASE IF NOT EXISTS rate_your_neighbor;
USE rate_your_neighbor;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON rate_your_neighbor.* TO 'user'@'%';
FLUSH PRIVILEGES;

-- ========================================
-- 1. TABLE RESIDENCES (Immeubles)
-- ========================================
CREATE TABLE IF NOT EXISTS residences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. TABLE HOUSES (Foyers/Appartements)
-- ========================================
CREATE TABLE IF NOT EXISTS houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    residence_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    referent_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
    FOREIGN KEY (referent_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_residence_id (residence_id),
    INDEX idx_referent_user_id (referent_user_id),
    UNIQUE KEY unique_address_residence (address, residence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. TABLE OCCUPANTS (Membres des foyers)
-- ========================================
CREATE TABLE IF NOT EXISTS occupants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    INDEX idx_house_id (house_id),
    INDEX idx_name (firstname, lastname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. TABLE REVIEWS (Avis/Notes)
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submitter_user_id INT NOT NULL,
    author_occupant_id INT NOT NULL,
    target_occupant_id INT NOT NULL,
    context_house_id INT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (rating >= 0 AND rating <= 5),
    FOREIGN KEY (submitter_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_occupant_id) REFERENCES occupants(id) ON DELETE CASCADE,
    FOREIGN KEY (target_occupant_id) REFERENCES occupants(id) ON DELETE CASCADE,
    FOREIGN KEY (context_house_id) REFERENCES houses(id) ON DELETE CASCADE,
    INDEX idx_target_occupant_id (target_occupant_id),
    INDEX idx_author_occupant_id (author_occupant_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. TABLE REPORTS (Signalements)
-- ========================================
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_user_id INT NOT NULL,
    target_occupant_id INT NOT NULL,
    reason ENUM('bruit', 'degradation', 'incivilite', 'autre') NOT NULL,
    description TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_occupant_id) REFERENCES occupants(id) ON DELETE CASCADE,
    INDEX idx_target_occupant_id (target_occupant_id),
    INDEX idx_is_processed (is_processed),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. TABLE EVENTS (Événements de résidence)
-- ========================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location VARCHAR(255),
    min_score_required DECIMAL(3, 1) DEFAULT 2.5,
    residence_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
    INDEX idx_residence_id (residence_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. TABLE EVENT_PARTICIPANTS (Participants aux événements - Relation many-to-many)
-- ========================================
CREATE TABLE IF NOT EXISTS event_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    occupant_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (occupant_id) REFERENCES occupants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_occupant (event_id, occupant_id),
    INDEX idx_event_id (event_id),
    INDEX idx_occupant_id (occupant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;