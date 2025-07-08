const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

/* Cria tabela se não existir */
const createTable = `
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
pool.query(createTable)
  .then(() => console.log("Tabela 'registros' OK"))
  .catch(err => console.error("Erro tabela:", err));

module.exports = pool;
