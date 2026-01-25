const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les foyers
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { residence_id, address, referent_user_id } = req.body;
    
    if (!residence_id || !address) {
      return res.status(400).json({ message: 'residence_id et address sont requis' });
    }

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
router.get('/:id', async (req, res) => {
  try {
    const houseId = req.params.id;
    
    const [houses] = await db.query('SELECT * FROM houses WHERE id = ?', [houseId]);
    if (houses.length === 0) {
      return res.status(404).json({ message: 'Foyer non trouvé' });
    }

    const [scores] = await db.query(`
      SELECT household_score, occupant_count
      FROM house_scores
      WHERE id = ?
    `, [houseId]);

    const house = houses[0];
    const scoreData = scores.length > 0 ? scores[0] : { household_score: 2.5, occupant_count: 0 };

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
router.patch('/:id', async (req, res) => {
  try {
    const houseId = req.params.id;
    const { address, referent_user_id } = req.body;

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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
