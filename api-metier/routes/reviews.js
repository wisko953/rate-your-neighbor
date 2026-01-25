const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les avis
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
