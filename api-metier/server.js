const express = require('express');
const cors = require('cors');
// 1. IMPORTS SWAGGER
const { swaggerUi, swaggerSpec } = require('./routes/docs');
const swaggerJsDoc = require('swagger-jsdoc');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CONFIGURATION SWAGGER
// Dans server.js

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Rate Your Neighbor API',
            version: '1.0.0',
            description: 'API de gestion de voisinage (Notes, Signalements, Expulsions)',
        },
        servers: [
            { url: `http://localhost:${PORT}` }
        ],
    },
    // AJOUTE LE CHEMIN VERS LE NOUVEAU FICHIER ICI
    apis: ['./routes/neighbors.js', './routes/docs.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// 3. ROUTE DE DOCUMENTATION
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes métier
const neighborsRoutes = require('./routes/neighbors');
app.use('/api/neighbors', neighborsRoutes);

// ... le reste de ton code (Health check, 404, etc.) ...

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Métier sur le port ${PORT}`);
  console.log(`Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
});