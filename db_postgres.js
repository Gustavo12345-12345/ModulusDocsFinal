const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

// Criação da tabela caso não exista
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

// Exportar a pool para o restante da aplicação
module.exports = pool;
