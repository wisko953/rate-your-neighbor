const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Connexion MySQL

// ==========================================
// 1. ROUTES RESIDENCES
// ==========================================

// GET ALL - Récupérer toutes les résidences
router.get('/residences', async (req, res) => {
  try {
    const [residences] = await db.query('SELECT * FROM residences');
    res.json(residences);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer une nouvelle résidence
router.post('/residences', async (req, res) => {
  try {
    const { name, address, city, manager_id } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ message: 'name et address sont requis' });
    }

    const query = 'INSERT INTO residences (name, address, city, manager_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [name, address, city || null, manager_id || null]);
    
    res.status(201).json({
      id: result.insertId,
      name,
      address,
      city: city || null,
      manager_id: manager_id || null
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// GET - Leaderboard par résidence
router.get('/residences/:id/leaderboard', async (req, res) => {
  try {
    const residenceId = req.params.id;
    
    // Vérifier que la résidence existe
    const [residences] = await db.query('SELECT * FROM residences WHERE id = ?', [residenceId]);
    if (residences.length === 0) {
      return res.status(404).json({ message: 'Résidence non trouvée' });
    }

    // Récupérer le leaderboard depuis la vue
    const [leaderboard] = await db.query(`
      SELECT house_id as id, house_address as address, household_score as score, ranking
      FROM residence_leaderboards
      WHERE residence_id = ?
      ORDER BY ranking ASC
    `, [residenceId]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE - Supprimer une résidence
router.delete('/residences/:id', async (req, res) => {
  try {
    const residenceId = req.params.id;
    
    const [result] = await db.query('DELETE FROM residences WHERE id = ?', [residenceId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Résidence non trouvée' });
    }

    res.json({ message: 'Résidence supprimée', id: residenceId });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 2. ROUTES HOUSES (Foyers)
// ==========================================

// GET ALL - Récupérer tous les foyers
router.get('/houses', async (req, res) => {
  try {
    const [houses] = await db.query(`
      SELECT h.*, r.name as residence_name, u.email as referent_email
      FROM houses h
      LEFT JOIN residences r ON h.residence_id = r.id
      LEFT JOIN users u ON h.referent_user_id = u.id
    `);
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouveau foyer
router.post('/houses', async (req, res) => {
  try {
    const { residence_id, address, referent_user_id } = req.body;
    
    if (!residence_id || !address) {
      return res.status(400).json({ message: 'residence_id et address sont requis' });
    }

    // Vérifier que la résidence existe
    const [residences] = await db.query('SELECT id FROM residences WHERE id = ?', [residence_id]);
    if (residences.length === 0) {
      return res.status(404).json({ message: 'Résidence non trouvée' });
    }

    const query = 'INSERT INTO houses (residence_id, address, referent_user_id) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [residence_id, address, referent_user_id || null]);

    res.status(201).json({
      id: result.insertId,
      residence_id,
      address,
      referent_user_id: referent_user_id || null
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// GET - Récupérer un foyer avec son score
router.get('/houses/:id', async (req, res) => {
  try {
    const houseId = req.params.id;
    
    const [houses] = await db.query('SELECT * FROM houses WHERE id = ?', [houseId]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    // Récupérer les scores depuis la vue
    const [scores] = await db.query(`
      SELECT household_score, occupant_count
      FROM house_scores
      WHERE id = ?
    `, [houseId]);

    const house = houses[0];
    const scoreData = scores.length > 0 ? scores[0] : { household_score: 2.5, occupant_count: 0 };

    // Déterminer le statut
    let status = 'COMPLIANT';
    if (scoreData.household_score < 0.5) {
      status = 'EXPULSION_WARNING';
    } else if (scoreData.household_score > 4.5) {
      status = 'BONUS_ELIGIBLE';
    }

    res.json({
      ...house,
      currentScore: scoreData.household_score,
      occupantCount: scoreData.occupant_count,
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PATCH - Modifier un foyer
router.patch('/houses/:id', async (req, res) => {
  try {
    const houseId = req.params.id;
    const { address, referent_user_id } = req.body;

    // Vérifier que le foyer existe
    const [houses] = await db.query('SELECT * FROM houses WHERE id = ?', [houseId]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    const updateQuery = 'UPDATE houses SET address = ?, referent_user_id = ? WHERE id = ?';
    await db.query(updateQuery, [
      address !== undefined ? address : houses[0].address,
      referent_user_id !== undefined ? referent_user_id : houses[0].referent_user_id,
      houseId
    ]);

    res.json({ message: 'Foyer modifié', id: houseId });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error: error.message });
  }
});

// DELETE - Supprimer un foyer
router.delete('/houses/:id', async (req, res) => {
  try {
    const houseId = req.params.id;
    
    const [result] = await db.query('DELETE FROM houses WHERE id = ?', [houseId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 3. ROUTES USERS (Référents/Admins)
// ==========================================

// GET ALL - Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouvel utilisateur
router.post('/users', async (req, res) => {
  try {
    const { email, password_hash, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'email est requis' });
    }

    const query = 'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [
      email,
      password_hash || null,
      role || 'user'
    ]);

    res.status(201).json({
      id: result.insertId,
      email,
      role: role || 'user'
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// POST - Approuver l'expulsion (Admin)
router.post('/users/:id/approve-expulsion', async (req, res) => {
  try {
    const userId = req.params.id;
    const { houseId } = req.body;

    if (!houseId) {
      return res.status(400).json({ message: 'houseId est requis' });
    }

    // Vérifier que l'utilisateur est admin
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Utilisateur non autorisé (Admin requis)' });
    }

    // Vérifier que le foyer existe et récupérer son score
    const [houses] = await db.query('SELECT address FROM houses WHERE id = ?', [houseId]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    // Vérifier que le score justifie l'expulsion (< 0.5)
    const [scores] = await db.query(`
      SELECT household_score FROM house_scores WHERE id = ?
    `, [houseId]);

    const score = scores.length > 0 ? scores[0].household_score : 2.5;

    if (score >= 0.5) {
      return res.status(400).json({
        message: 'Les conditions d\'expulsion ne sont pas remplies',
        currentScore: score,
        requiredScoreForExpulsion: '< 0.5'
      });
    }

    res.json({
      message: 'EXPULSION APPROVED',
      house: houses[0].address,
      score: score
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 4. ROUTES OCCUPANTS (Membres des foyers)
// ==========================================

// GET ALL - Récupérer tous les occupants
router.get('/occupants', async (req, res) => {
  try {
    const [occupants] = await db.query(`
      SELECT o.*, h.address as house_address, r.name as residence_name
      FROM occupants o
      LEFT JOIN houses h ON o.house_id = h.id
      LEFT JOIN residences r ON h.residence_id = r.id
    `);
    res.json(occupants);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouvel occupant
router.post('/occupants', async (req, res) => {
  try {
    const { house_id, firstname, lastname, age } = req.body;
    
    if (!house_id || !firstname || !lastname) {
      return res.status(400).json({ message: 'house_id, firstname, lastname sont requis' });
    }

    // Vérifier que la maison existe
    const [houses] = await db.query('SELECT id FROM houses WHERE id = ?', [house_id]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    const query = 'INSERT INTO occupants (house_id, firstname, lastname, age) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [house_id, firstname, lastname, age || null]);

    res.status(201).json({
      id: result.insertId,
      house_id,
      firstname,
      lastname,
      age: age || null
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// GET - Récupérer un occupant avec son score
router.get('/occupants/:id', async (req, res) => {
  try {
    const occupantId = req.params.id;

    const [occupants] = await db.query('SELECT * FROM occupants WHERE id = ?', [occupantId]);
    if (occupants.length === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

    // Récupérer le score depuis la vue
    const [scores] = await db.query(`
      SELECT individual_score, review_count
      FROM occupant_scores
      WHERE id = ?
    `, [occupantId]);

    const scoreData = scores.length > 0 ? scores[0] : { individual_score: 2.5, review_count: 0 };

    res.json({
      ...occupants[0],
      score: scoreData.individual_score,
      reviewCount: scoreData.review_count
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PATCH - Modifier un occupant
router.patch('/occupants/:id', async (req, res) => {
  try {
    const occupantId = req.params.id;
    const { firstname, lastname, age } = req.body;

    const [occupants] = await db.query('SELECT * FROM occupants WHERE id = ?', [occupantId]);
    if (occupants.length === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

    const updateQuery = 'UPDATE occupants SET firstname = ?, lastname = ?, age = ? WHERE id = ?';
    await db.query(updateQuery, [
      firstname !== undefined ? firstname : occupants[0].firstname,
      lastname !== undefined ? lastname : occupants[0].lastname,
      age !== undefined ? age : occupants[0].age,
      occupantId
    ]);

    res.json({ message: 'Occupant modifié', id: occupantId });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error: error.message });
  }
});

// DELETE - Supprimer un occupant
router.delete('/occupants/:id', async (req, res) => {
  try {
    const occupantId = req.params.id;
    
    const [result] = await db.query('DELETE FROM occupants WHERE id = ?', [occupantId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 5. ROUTES REVIEWS (Avis/Notes)
// ==========================================

// GET ALL - Récupérer tous les avis
router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.email as submitter_email,
             a.firstname as author_firstname, a.lastname as author_lastname,
             t.firstname as target_firstname, t.lastname as target_lastname
      FROM reviews r
      LEFT JOIN users u ON r.submitter_user_id = u.id
      LEFT JOIN occupants a ON r.author_occupant_id = a.id
      LEFT JOIN occupants t ON r.target_occupant_id = t.id
    `);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouvel avis
router.post('/reviews', async (req, res) => {
  try {
    const { submitter_user_id, author_occupant_id, target_occupant_id, context_house_id, rating, comment, is_anonymous } = req.body;
    
    if (!submitter_user_id || !author_occupant_id || !target_occupant_id || !context_house_id || rating === undefined) {
      return res.status(400).json({ 
        message: 'submitter_user_id, author_occupant_id, target_occupant_id, context_house_id, rating sont requis' 
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'rating doit être entre 0 et 5' });
    }

    // Vérifier que les entités existent
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [submitter_user_id]);
    const [authorOcc] = await db.query('SELECT id FROM occupants WHERE id = ?', [author_occupant_id]);
    const [targetOcc] = await db.query('SELECT id FROM occupants WHERE id = ?', [target_occupant_id]);
    const [house] = await db.query('SELECT id FROM houses WHERE id = ?', [context_house_id]);

    if (users.length === 0 || authorOcc.length === 0 || targetOcc.length === 0 || house.length === 0) {
      return res.status(404).json({ message: 'Utilisateur, auteur, cible ou foyer non trouvé' });
    }

    const query = `INSERT INTO reviews 
      (submitter_user_id, author_occupant_id, target_occupant_id, context_house_id, rating, comment, is_anonymous) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.query(query, [
      submitter_user_id,
      author_occupant_id,
      target_occupant_id,
      context_house_id,
      rating,
      comment || null,
      is_anonymous ? 1 : 0
    ]);

    res.status(201).json({
      id: result.insertId,
      submitter_user_id,
      author_occupant_id,
      target_occupant_id,
      context_house_id,
      rating,
      comment: comment || null,
      is_anonymous: is_anonymous || false
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// DELETE - Supprimer un avis
router.delete('/reviews/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 6. ROUTES REPORTS (Signalements)
// ==========================================

// GET ALL - Récupérer tous les signalements
router.get('/reports', async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT r.*,
             u.email as author_email,
             o.firstname, o.lastname
      FROM reports r
      LEFT JOIN users u ON r.author_user_id = u.id
      LEFT JOIN occupants o ON r.target_occupant_id = o.id
    `);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un signalement
router.post('/reports', async (req, res) => {
  try {
    const { author_user_id, target_occupant_id, reason, description } = req.body;
    
    if (!author_user_id || !target_occupant_id || !reason) {
      return res.status(400).json({ 
        message: 'author_user_id, target_occupant_id, reason sont requis' 
      });
    }

    // Vérifier que l'utilisateur et l'occupant existent
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [author_user_id]);
    const [occupants] = await db.query('SELECT id FROM occupants WHERE id = ?', [target_occupant_id]);

    if (users.length === 0 || occupants.length === 0) {
      return res.status(404).json({ message: 'Utilisateur ou occupant non trouvé' });
    }

    const query = `INSERT INTO reports 
      (author_user_id, target_occupant_id, reason, description) 
      VALUES (?, ?, ?, ?)`;
    
    const [result] = await db.query(query, [
      author_user_id,
      target_occupant_id,
      reason,
      description || null
    ]);

    res.status(201).json({
      id: result.insertId,
      author_user_id,
      target_occupant_id,
      reason,
      description: description || null,
      is_processed: false
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// PATCH - Modifier un signalement
router.patch('/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { is_processed } = req.body;

    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }

    if (is_processed !== undefined) {
      await db.query('UPDATE reports SET is_processed = ? WHERE id = ?', [is_processed ? 1 : 0, reportId]);
    }

    res.json({ message: 'Signalement modifié', id: reportId });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error: error.message });
  }
});

// DELETE - Supprimer un signalement
router.delete('/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    
    const [result] = await db.query('DELETE FROM reports WHERE id = ?', [reportId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ==========================================
// 7. ROUTES EVENTS (Événements)
// ==========================================

// GET ALL - Récupérer tous les événements
router.get('/events', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, r.name as residence_name
      FROM events e
      LEFT JOIN residences r ON e.residence_id = r.id
    `);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouvel événement
router.post('/events', async (req, res) => {
  try {
    const { title, description, date, location, min_score_required, residence_id } = req.body;
    
    if (!title || !residence_id) {
      return res.status(400).json({ message: 'title et residence_id sont requis' });
    }

    // Vérifier que la résidence existe
    const [residences] = await db.query('SELECT id FROM residences WHERE id = ?', [residence_id]);
    if (residences.length === 0) {
      return res.status(404).json({ message: 'Résidence non trouvée' });
    }

    const query = `INSERT INTO events 
      (title, description, date, location, min_score_required, residence_id) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.query(query, [
      title,
      description || null,
      date || null,
      location || null,
      min_score_required || 2.5,
      residence_id
    ]);

    res.status(201).json({
      id: result.insertId,
      title,
      description: description || null,
      date: date || null,
      location: location || null,
      min_score_required: min_score_required || 2.5,
      residence_id
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// PATCH - Modifier un événement
router.patch('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, location, min_score_required } = req.body;

    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const updateQuery = `UPDATE events 
      SET title = ?, description = ?, date = ?, location = ?, min_score_required = ? 
      WHERE id = ?`;
    
    await db.query(updateQuery, [
      title !== undefined ? title : events[0].title,
      description !== undefined ? description : events[0].description,
      date !== undefined ? date : events[0].date,
      location !== undefined ? location : events[0].location,
      min_score_required !== undefined ? min_score_required : events[0].min_score_required,
      eventId
    ]);

    res.json({ message: 'Événement modifié', id: eventId });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error: error.message });
  }
});

// DELETE - Supprimer un événement
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const [result] = await db.query('DELETE FROM events WHERE id = ?', [eventId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Inscrire un occupant à un événement
router.post('/events/:id/register', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { occupant_id } = req.body;

    if (!occupant_id) {
      return res.status(400).json({ message: 'occupant_id est requis' });
    }

    // Vérifier que l'événement existe
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Vérifier que l'occupant existe
    const [occupants] = await db.query('SELECT house_id FROM occupants WHERE id = ?', [occupant_id]);
    if (occupants.length === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

    // Récupérer le score du foyer de l'occupant
    const houseId = occupants[0].house_id;
    const [scores] = await db.query(`
      SELECT household_score FROM house_scores WHERE id = ?
    `, [houseId]);

    const householdScore = scores.length > 0 ? scores[0].household_score : 2.5;
    const minScoreRequired = events[0].min_score_required;

    // Vérifier l'éligibilité
    if (householdScore < minScoreRequired) {
      return res.status(403).json({
        message: 'Inscription refusée - Score du foyer trop bas',
        required: minScoreRequired,
        current: householdScore
      });
    }

    // Vérifier si l'occupant n'est pas déjà inscrit
    const [existing] = await db.query(
      'SELECT id FROM event_participants WHERE event_id = ? AND occupant_id = ?',
      [eventId, occupant_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Occupant déjà inscrit à cet événement' });
    }

    // Inscrire l'occupant
    const query = 'INSERT INTO event_participants (event_id, occupant_id) VALUES (?, ?)';
    const [result] = await db.query(query, [eventId, occupant_id]);

    res.json({
      message: 'Registration successful',
      event: events[0].title,
      participantId: result.insertId
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
});

module.exports = router;
