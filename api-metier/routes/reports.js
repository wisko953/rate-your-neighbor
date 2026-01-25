const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les signalements
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { author_user_id, target_occupant_id, reason, description } = req.body;
    
    if (!author_user_id || !target_occupant_id || !reason) {
      return res.status(400).json({ 
        message: 'author_user_id, target_occupant_id, reason sont requis' 
      });
    }

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
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
