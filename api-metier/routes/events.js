const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET ALL - Récupérer tous les événements
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { title, description, date, location, min_score_required, residence_id } = req.body;
    
    if (!title || !residence_id) {
      return res.status(400).json({ message: 'title et residence_id sont requis' });
    }

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
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.post('/:id/register', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { occupant_id } = req.body;

    if (!occupant_id) {
      return res.status(400).json({ message: 'occupant_id est requis' });
    }

    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const [occupants] = await db.query('SELECT house_id FROM occupants WHERE id = ?', [occupant_id]);
    if (occupants.length === 0) {
      return res.status(404).json({ message: 'Occupant non trouvé' });
    }

    const houseId = occupants[0].house_id;
    const [scores] = await db.query(`
      SELECT household_score FROM house_scores WHERE id = ?
    `, [houseId]);

    const householdScore = scores.length > 0 ? scores[0].household_score : 2.5;
    const minScoreRequired = events[0].min_score_required;

    if (householdScore < minScoreRequired) {
      return res.status(403).json({
        message: 'Inscription refusée - Score du foyer trop bas',
        required: minScoreRequired,
        current: householdScore
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM event_participants WHERE event_id = ? AND occupant_id = ?',
      [eventId, occupant_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Occupant déjà inscrit à cet événement' });
    }

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
