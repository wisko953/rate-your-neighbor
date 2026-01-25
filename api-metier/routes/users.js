const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer un nouvel utilisateur
router.post('/', async (req, res) => {
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
router.post('/:id/approve-expulsion', async (req, res) => {
  try {
    const userId = req.params.id;
    const { houseId } = req.body;

    if (!houseId) {
      return res.status(400).json({ message: 'houseId est requis' });
    }

    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Utilisateur non autorisé (Admin requis)' });
    }

    const [houses] = await db.query('SELECT address FROM houses WHERE id = ?', [houseId]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
