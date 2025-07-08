document.addEventListener('DOMContentLoaded', () => {
  /* ----- Referências ----- */
  const form        = document.getElementById('registroForm');
  const tbody       = document.querySelector('#tabelaRegistros tbody');
  const btnExportar = document.getElementById('exportarCSV');
  const btnLogout   = document.getElementById('logoutBtn');

  /* ----- WebSocket seguro ----- */
  const wsProto = location.protocol === 'https:' ? 'wss' : 'ws';
  let socket;
  try {
    socket = new WebSocket(`${wsProto}://${location.host}`);
    socket.onmessage = carregarRegistros;
  } catch (err) {
    console.warn('WebSocket indisponível:', err);
  }

  /* ----- Carrega tabela ----- */
  async function carregarRegistros() {
    try {
      const res = await fetch('/api/registros', { credentials:'include' });
      const dados = await res.json();
      if (!Array.isArray(dados)) return;

      tbody.innerHTML = '';
      dados.forEach(r => {
        const tr = document.createElement('tr');

        [
          r.Projeto, r.TipoObra, r.TipoProjeto, r.TipoDoc, r.Disciplina,
          r.Sequencia, r.Revisao, r.CodigoArquivo, r.Data, r.Autor
        ].forEach(val => {
          const td = document.createElement('td');
          td.textContent = val ?? '';
          tr.appendChild(td);
        });

        /* Ações */
        const tdAcoes = document.createElement('td');

        const addBtn = (txt, fn) => {
          const b = document.createElement('button');
          b.textContent = txt; b.onclick = fn; tdAcoes.appendChild(b);
        };
        addBtn('↑ Seq', () => atualizarCampo(r.CodigoArquivo,'Sequencia',Number(r.Sequencia)+1));
        addBtn('↑ Rev', () => atualizarCampo(r.CodigoArquivo,'Revisao', Number(r.Revisao) +1));
        addBtn('🗑',   () => deletarRegistro(r.CodigoArquivo));

        tr.appendChild(tdAcoes);
        tbody.appendChild(tr);
      });
    } catch (e) { console.error(e); }
  }

  /* ----- Submit do formulário ----- */
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd   = new FormData(form);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch('/api/data',{
        method:'POST', headers:{'Content-Type':'application/json'},
        credentials:'include', body:JSON.stringify(body)
      });
      res.ok ? (form.reset(), carregarRegistros()) : alert('Erro ao salvar.');
    } catch (err) { console.error(err); }
  });

  /* ----- Funções auxiliares ----- */
  async function atualizarCampo(codigo,campo,valor){
    await fetch(`/api/data/${codigo}/campo`,{
      method:'PUT', headers:{'Content-Type':'application/json'},
      credentials:'include', body:JSON.stringify({ campo,valor })
    });
  }

  async function deletarRegistro(codigo){
    if (!confirm('Confirma exclusão?')) return;
    await fetch(`/api/data/${codigo}`, { method:'DELETE', credentials:'include' });
  }

  btnExportar?.addEventListener('click', () => { location.href='/api/exportar-csv'; });
  btnLogout?.addEventListener('click',  () => { location.href='/logout'; });

  /* Inicialização */
  carregarRegistros();
});
