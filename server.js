// server.js - VERSÃO CORRIGIDA E AJUSTADA

const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./db_postgres'); //

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cookieParser());

// SERVE TODOS OS ARQUIVOS ESTÁTICOS DA PASTA ATUAL
app.use(express.static(__dirname)); //

// ✅ Serve index.html na raiz /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); //
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
} //

// ✅ Login
app.post('/login', (req, res) => {
  const user = req.body.user;
  if (!user) {
    return res.status(400).json({ error: 'Usuário não informado' });
  }
  res.cookie('authUser', user, { httpOnly: false });
  res.json({ success: true });
}); //

app.get('/logout', (req, res) => {
  res.clearCookie('authUser');
  res.redirect('/login.html'); //
});

// ✅ GET registros - ROTA CORRIGIDA
app.get('/registros', async (req, res) => { // MUDANÇA: de '/api/registros' para '/registros'
  try {
    const result = await db.query('SELECT * FROM registros ORDER BY id DESC'); //
    // SIMPLIFICADO: Envia os dados como estão no banco (letras minúsculas)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar banco.' });
  }
});

// ✅ POST - inserir registro - ROTA CORRIGIDA
app.post('/registro', async (req, res) => { // MUDANÇA: de '/api/data' para '/registro'
  const data = req.body;
  const autor = req.cookies.authUser || 'DESCONHECIDO'; //

  const sql = `
    INSERT INTO registros
      (Projeto, TipoObra, TipoProjeto, TipoDoc, Disciplina,
       Sequencia, Revisao, CodigoArquivo, Data, Autor)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `; //
  const values = [
    data.projeto,
    data.tipo_obra,
    data.tipo_projeto,
    data.tipo_doc,
    data.disciplina,
    data.sequencia,
    data.revisao,
    data.codigo_arquivo,
    data.data,
    autor
  ]; //

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

// ✅ DELETE - ROTA CORRIGIDA
app.delete('/registro/:id', async (req, res) => { // MUDANÇA: de '/api/data/:codigoArquivo' para '/registro/:id'
  const id = req.params.id;
  try {
    await db.query('DELETE FROM registros WHERE id = $1', [id]); //
    broadcast({ action: 'delete' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar.' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); //
