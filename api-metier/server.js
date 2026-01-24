const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes métier
const residencesRoutes = require('./routes/residences');
const housesRoutes = require('./routes/houses');
const usersRoutes = require('./routes/users');
const occupantsRoutes = require('./routes/occupants');
const reviewsRoutes = require('./routes/reviews');
const reportsRoutes = require('./routes/reports');
const eventsRoutes = require('./routes/events');

app.use('/api/residences', residencesRoutes);
app.use('/api/houses', housesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/occupants', occupantsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API Métier is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint non trouvé' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Métier sur le port ${PORT}`);
  console.log(`Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
});