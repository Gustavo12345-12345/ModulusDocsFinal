const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./db_postgres');          // Conexão PostgreSQL

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

/* ---------- Middlewares ---------- */
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));

/* ---------- WebSocket ---------- */
let clients = [];
wss.on('connection', ws => {
  clients.push(ws);
  ws.on('close', () => { clients = clients.filter(c => c !== ws); });
});

function broadcast(message) {
  const msg = JSON.stringify(message);
  clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(msg));
}

/* ---------- Rotas ---------- */
app.get('/',       (_,res) => res.sendFile(path.join(__dirname,'index.html')));
app.get('/login',  (_,res) => res.sendFile(path.join(__dirname,'login.html')));
app.get('/logout', (req,res) => { res.clearCookie('authUser'); res.redirect('/login'); });

app.post('/login', (req,res) => {
  let body = '';
  req.on('data',  ch => (body += ch));
  req.on('end', () => {
    try {
      const { user } = JSON.parse(body);
      res.cookie('authUser', user, { httpOnly:false });
      res.sendStatus(200);
    } catch { res.sendStatus(400); }
  });
});

/* --- SELECT registros --- */
app.get('/api/registros', async (_,res) => {
  try {
    const { rows } = await db.query('SELECT * FROM registros ORDER BY id DESC');
    // Ajusta data para dd/mm/aaaa
    const parsed = rows.map(r => ({
      Projeto:       r.projeto,
      TipoObra:      r.tipoobra,
      TipoProjeto:   r.tipoprojeto,
      TipoDoc:       r.tipodoc,
      Disciplina:    r.disciplina,
      Sequencia:     r.sequencia,
      Revisao:       r.revisao,
      CodigoArquivo: r.codigoarquivo,
      Data:          new Date(r.data).toLocaleDateString('pt-BR'),
      Autor:         r.autor
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Erro ao consultar banco.' });
  }
});

/* --- INSERT / UPDATE registro --- */
app.post('/api/data', async (req,res) => {
  const d     = req.body;
  const autor = req.cookies.authUser || 'DESCONHECIDO';

  const camposObrig = ['Projeto','TipoObra','TipoProjeto','TipoDoc','Disciplina','Sequencia','Revisao','CodigoArquivo','Data'];
  for (const c of camposObrig) {
    if (!d[c]) return res.status(400).json({ error:`Campo obrigatório faltando: ${c}` });
  }

  const sql = `
    INSERT INTO registros
      (Projeto,TipoObra,TipoProjeto,TipoDoc,Disciplina,Sequencia,Revisao,CodigoArquivo,Data,Autor)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (CodigoArquivo) DO UPDATE SET
      Projeto      = EXCLUDED.Projeto,
      TipoObra     = EXCLUDED.TipoObra,
      TipoProjeto  = EXCLUDED.TipoProjeto,
      TipoDoc      = EXCLUDED.TipoDoc,
      Disciplina   = EXCLUDED.Disciplina,
      Sequencia    = EXCLUDED.Sequencia,
      Revisao      = EXCLUDED.Revisao,
      Data         = EXCLUDED.Data,
      Autor        = EXCLUDED.Autor;
  `;

  const vals = [
    d.Projeto, d.TipoObra, d.TipoProjeto, d.TipoDoc, d.Disciplina,
    d.Sequencia, d.Revisao, d.CodigoArquivo, d.Data, autor
  ];

  try {
    await db.query(sql, vals);
    broadcast({ action:'update' });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Erro ao salvar.' });
  }
});

/* --- DELETE --- */
app.delete('/api/data/:codigo', async (req,res) => {
  try {
    await db.query('DELETE FROM registros WHERE CodigoArquivo = $1',[req.params.codigo]);
    broadcast({ action:'delete' });
    res.sendStatus(200);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Erro ao deletar.' });
  }
});

/* --- UPDATE campo específico --- */
app.put('/api/data/:codigo/campo', async (req,res) => {
  const { campo, valor } = req.body;
  if (!['Sequencia','Revisao'].includes(campo))
    return res.status(400).json({ error:'Campo inválido.' });
  try {
    await db.query(`UPDATE registros SET ${campo} = $1 WHERE CodigoArquivo = $2`, [valor, req.params.codigo]);
    broadcast({ action:'update' });
    res.sendStatus(200);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'Erro ao atualizar.' });
  }
});

/* --- Exportar CSV --- */
app.get('/api/exportar-csv', async (_,res) => {
  try {
    const { rows } = await db.query('SELECT * FROM registros');
    if (!rows.length) return res.send('Nenhum registro.');
    const header = Object.keys(rows[0]).join(',');
    const csv    = [header, ...rows.map(r => Object.values(r).map(v=>`"${v}"`).join(','))].join('\n');
    res.header('Content-Type','text/csv');
    res.attachment('dados.csv').send(csv);
  } catch (err) {
    console.error(err); res.status(500).send('Erro CSV.');
  }
});

/* ---------- Start ---------- */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
