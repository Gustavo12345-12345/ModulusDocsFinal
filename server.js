const express = require('express');
const app = express();
const path = require('path');
const db = require('./db_postgres');
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando...');
});
