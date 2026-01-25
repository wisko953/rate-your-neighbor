const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les occupants
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { house_id, firstname, lastname, age } = req.body;
    
    if (!house_id || !firstname || !lastname) {
      return res.status(400).json({ message: 'house_id, firstname, lastname sont requis' });
    }

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
router.get('/:id', async (req, res) => {
  try {
    const occupantId = req.params.id;

    const [occupants] = await db.query('SELECT * FROM occupants WHERE id = ?', [occupantId]);
    if (occupants.length === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

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
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
