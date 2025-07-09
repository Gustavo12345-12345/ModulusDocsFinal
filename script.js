document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('tabelaRegistros');

  // ----------------------------
  // Carregar registros do banco
  // ----------------------------
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

        // Botão para deletar
        const tdAcoes = document.createElement('td');
        const btnDel = document.createElement('button');
        btnDel.textContent = '🗑️';
        btnDel.style.cursor = 'pointer';
        btnDel.addEventListener('click', () => deletarRegistro(r.CodigoArquivo));
        tdAcoes.appendChild(btnDel);
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // ----------------------------
  // Enviar novo registro
  // ----------------------------
  document.getElementById('btnGerar').addEventListener('click', async () => {
    const Projeto     = document.getElementById('CodigoProjeto').value.trim();
    const TipoProjeto = document.getElementById('TipoProjeto').value.trim();
    const TipoObra    = document.getElementById('TipoObra').value.trim();
    const Disciplina  = document.getElementById('Disciplina').value.trim();
    const TipoDoc     = document.getElementById('TipoDoc').value.trim();
    const Sequencia   = document.getElementById('Sequencia').value.trim().padStart(3,'0');
    const Revisao     = (document.getElementById('Revisao').value || '00').trim();
    const Autor       = document.getElementById('Autor').value.trim();

    // --- Validação obrigatória
    if (!Projeto || !TipoProjeto || !TipoObra || !Disciplina || !TipoDoc || !Sequencia || !Revisao || !Autor) {
      alert('⚠️ Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    // Montar código
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
      Data: hoje,
      Autor
    };

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('✅ Registro salvo com sucesso!');
        await carregarRegistros();
      } else {
        alert('❌ Erro ao salvar. Verifique os campos.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao enviar dados.');
    }
  });

  // ----------------------------
  // Função deletar
  // ----------------------------
  async function deletarRegistro(codigo) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      const res = await fetch(`/api/data/${encodeURIComponent(codigo)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('🗑️ Registro excluído com sucesso!');
        await carregarRegistros();
      } else {
        alert('❌ Erro ao excluir registro.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao excluir registro.');
    }
  }

  // ----------------------------
  // Inicialização
  // ----------------------------
  carregarRegistros();
});
