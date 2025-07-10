const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./db_postgres');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cookieParser());

// SERVE TODOS OS ARQUIVOS ESTÁTICOS DA PASTA ATUAL
app.use(express.static(__dirname));

// ✅ Serve index.html na raiz /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ WebSocket setup
let clients = [];
wss.on('connection', ws => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});
function broadcast(message) {
  const msg = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// ✅ Login
app.post('/login', (req, res) => {
  const user = req.body.user;
  if (!user) {
    return res.status(400).json({ error: 'Usuário não informado' });
  }
  res.cookie('authUser', user, { httpOnly: false });
  res.json({ success: true });
});

app.get('/logout', (req, res) => {
  res.clearCookie('authUser');
  res.redirect('/login.html');
});

// ✅ GET registros
app.get('/api/registros', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM registros ORDER BY id DESC');
    const parsed = result.rows.map(r => ({
      Projeto:       r.projeto,
      TipoObra:      r.tipoobra,
      TipoProjeto:   r.tipoprojeto,
      TipoDoc:       r.tipodoc,
      Disciplina:    r.disciplina,
      Sequencia:     r.sequencia,
      Revisao:       r.revisao,
      CodigoArquivo: r.codigoarquivo,
      Data:          r.data ? new Date(r.data).toISOString().split('T')[0] : '',
      Autor:         r.autor
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar banco.' });
  }
});

// ✅ POST - inserir ou atualizar
app.post('/api/data', async (req, res) => {
  const data = req.body;
  const autor = data.Autor || req.cookies.authUser || 'DESCONHECIDO';

  const required = [
    'Projeto', 'TipoObra', 'TipoProjeto', 'TipoDoc',
    'Disciplina', 'Sequencia', 'Revisao', 'CodigoArquivo', 'Data', 'Autor'
  ];

  for (let field of required) {
    if (!data[field]) {
      console.error('Campo faltando:', field);
      return res.status(400).json({ error: `Campo obrigatório faltando: ${field}` });
    }
  }

  const sql = `
    INSERT INTO registros
      (Projeto, TipoObra, TipoProjeto, TipoDoc, Disciplina,
       Sequencia, Revisao, CodigoArquivo, Data, Autor)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (CodigoArquivo) DO UPDATE SET
      Projeto     = EXCLUDED.Projeto,
      TipoObra    = EXCLUDED.TipoObra,
      TipoProjeto = EXCLUDED.TipoProjeto,
      TipoDoc     = EXCLUDED.TipoDoc,
      Disciplina  = EXCLUDED.Disciplina,
      Sequencia   = EXCLUDED.Sequencia,
      Revisao     = EXCLUDED.Revisao,
      Data        = EXCLUDED.Data,
      Autor       = EXCLUDED.Autor
  `;
  const values = [
    data.Projeto,
    data.TipoObra,
    data.TipoProjeto,
    data.TipoDoc,
    data.Disciplina,
    data.Sequencia,
    data.Revisao,
    data.CodigoArquivo,
    data.Data,
    autor
  ];

  try {
    await db.query(sql, values);
    console.log('Registro salvo com sucesso!');
    broadcast({ action: 'update' });
    res.json({ success: true });
  } catch (err) {
    console.error('Erro SQL:', err);
    res.status(500).json({ error: 'Erro ao salvar no banco.' });
  }
});

// ✅ DELETE
app.delete('/api/data/:codigoArquivo', async (req, res) => {
  const codigo = req.params.codigoArquivo;
  try {
    await db.query('DELETE FROM registros WHERE CodigoArquivo = $1', [codigo]);
    broadcast({ action: 'delete' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar.' });
  }
});

// ✅ PUT - atualizar campo específico
app.put('/api/data/:codigoArquivo/campo', async (req, res) => {
  const { campo, valor } = req.body;
  const codigo = req.params.codigoArquivo;

  if (!['Sequencia', 'Revisao'].includes(campo)) {
    return res.status(400).json({ error: 'Campo inválido.' });
  }

  const sql = `UPDATE registros SET ${campo} = $1 WHERE CodigoArquivo = $2`;
  try {
    await db.query(sql, [valor, codigo]);
    broadcast({ action: 'update' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar campo.' });
  }
});

// ✅ Exportar CSV
app.get('/api/exportar-csv', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM registros');
    const rows = result.rows;
    if (!rows.length) {
      return res.send('Nenhum registro para exportar.');
    }
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('dados.csv').send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao exportar CSV.');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
