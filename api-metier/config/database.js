const mysql = require('mysql2/promise');

// Créer un pool de connexions MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'rate_user',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  database: process.env.DB_NAME || 'rate_your_neighbor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test de connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL établie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
