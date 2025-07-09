document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('tabelaRegistros');

  // ----- Carregar registros do banco -----
  async function carregarRegistros() {
    try {
      const res = await fetch('/api/registros', { credentials: 'include' });
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
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // ----- Enviar novo registro -----
  document.getElementById('btnGerar').addEventListener('click', async () => {
    const Projeto     = document.getElementById('CodigoProjeto').value;
    const TipoProjeto = document.getElementById('TipoProjeto').value;
    const TipoObra    = document.getElementById('TipoObra').value;
    const Disciplina  = document.getElementById('Disciplina').value;
    const TipoDoc     = document.getElementById('TipoDoc').value;
    const Sequencia   = document.getElementById('Sequencia').value.padStart(3,'0');
    const Revisao     = document.getElementById('Revisao').value || '00';

    const CodigoArquivo = `${Projeto}-${TipoProjeto}-${TipoObra}-${Disciplina}-${TipoDoc}-${Sequencia}-R${Revisao}`;
    const hoje = new Date().toISOString().slice(0,10);

    const body = {
      Projeto,
      TipoProjeto,
      TipoObra,
      Disciplina,
      TipoDoc,
      Sequencia,
      Revisao,
      CodigoArquivo,
      Data: hoje
    };

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('Registro salvo com sucesso!');
        await carregarRegistros();
      } else {
        alert('Erro ao salvar. Verifique os campos.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar dados.');
    }
  });

  // ----- Inicialização -----
  carregarRegistros();
});
