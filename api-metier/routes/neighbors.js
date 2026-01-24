const express = require('express');
const router = express.Router();

router.post('/rate', (req, res) => {
  res.json({
    success: true,
    message: 'Évaluation enregistrée'
  });
});

module.exports = router;
