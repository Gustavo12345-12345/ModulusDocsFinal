const createTableQuery = `
  CREATE TABLE IF NOT EXISTS registros (
    id SERIAL PRIMARY KEY,
    Projeto TEXT,
    TipoObra TEXT,
    TipoProjeto TEXT,
    TipoDoc TEXT,
    Disciplina TEXT,
    Sequencia TEXT,
    Revisao TEXT,
    CodigoArquivo TEXT UNIQUE,
    Data DATE,
    Autor TEXT
  )
`;

pool.query(createTableQuery)
  .then(() => console.log("Tabela 'registros' verificada/criada"))
  .catch(err => console.error("Erro ao criar tabela:", err));

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
