const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexão bem-sucedida:', result.rows[0]);
  } catch (err) {
    console.error('Erro ao conectar:', err);
  }
}

testConnection();

module.exports = pool;
