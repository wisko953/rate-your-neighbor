const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer toutes les résidences
router.get('/', async (req, res) => {
  try {
    const [residences] = await db.query('SELECT * FROM residences');
    res.json(residences);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST - Créer une nouvelle résidence
router.post('/', async (req, res) => {
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
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const residenceId = req.params.id;
    
    const [residences] = await db.query('SELECT * FROM residences WHERE id = ?', [residenceId]);
    if (residences.length === 0) {
      return res.status(404).json({ message: 'Résidence non trouvée' });
    }

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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
