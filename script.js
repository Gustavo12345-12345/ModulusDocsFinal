document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('tabelaRegistros');

  // 🔵 Guarda todos os dados originais para filtro
  let todosRegistros = [];

  // 🔵 Campos filtráveis
  const camposFiltraveis = [
    'Projeto', 'TipoObra', 'TipoProjeto', 'TipoDoc',
    'Disciplina', 'Sequencia', 'Revisao', 'CodigoArquivo', 'Data', 'Autor'
  ];

  // 🔵 Inputs de filtro por coluna
  const mapaFiltros = {
    'Projeto': document.getElementById('filtroProjeto'),
    'TipoObra': document.getElementById('filtroTipoObra'),
    'TipoProjeto': document.getElementById('filtroTipoProjeto'),
    'TipoDoc': document.getElementById('filtroTipoDoc'),
    'Disciplina': document.getElementById('filtroDisciplina'),
    'Sequencia': document.getElementById('filtroSequencia'),
    'Revisao': document.getElementById('filtroRevisao'),
    'CodigoArquivo': document.getElementById('filtroCodigoArquivo'),
    'Data': document.getElementById('filtroData'),
    'Autor': document.getElementById('filtroAutor')
  };

  // 🔵 Guarda os valores atuais dos filtros
  const filtrosAtivos = {};

  // 🔵 Configurar listeners para filtros por coluna
  for (let campo in mapaFiltros) {
    const input = mapaFiltros[campo];
    if (!input) continue;
    input.addEventListener('input', () => {
      filtrosAtivos[campo] = input.value.trim().toLowerCase();
      renderizarTabela();
    });
  }

  // 🔵 Listener para o filtro geral
  const filtroGeralInput = document.getElementById('filtroGeral');
  if (filtroGeralInput) {
    filtroGeralInput.addEventListener('input', () => {
      filtrosAtivos["__GERAL__"] = filtroGeralInput.value.trim().toLowerCase();
      renderizarTabela();
    });
  }

  // 🔵 Botão para exportar CSV filtrado
  const btnExportarCSV = document.getElementById('btnExportarCSV');
  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', () => {
      const dadosFiltrados = filtrarDados();
      if (!dadosFiltrados.length) {
        alert('⚠️ Nenhum dado para exportar.');
        return;
      }
      const header = camposFiltraveis.join(',');
      const linhas = dadosFiltrados.map(r =>
        camposFiltraveis.map(campo =>
          `"${(r[campo] || '').toString().replace(/"/g, '""')}"`
        ).join(',')
      );
      const csv = [header, ...linhas].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'registros_filtrados.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ----------------------------
  // Função para aplicar os filtros
  // ----------------------------
  function filtrarDados() {
    return todosRegistros.filter(r => {
      for (let campo in filtrosAtivos) {
        const valorFiltro = filtrosAtivos[campo];
        if (!valorFiltro) continue;

        if (campo === "__GERAL__") {
          const matchAlgumCampo = camposFiltraveis.some(col =>
            (r[col] || '').toString().toLowerCase().includes(valorFiltro)
          );
          if (!matchAlgumCampo) return false;
        } else {
          const valorCampo = (r[campo] || '').toString().toLowerCase();
          if (!valorCampo.includes(valorFiltro)) {
            return false;
          }
        }
      }
      return true;
    });
  }

  // ----------------------------
  // Renderizar tabela com filtros aplicados
  // ----------------------------
  function renderizarTabela() {
    const dadosFiltrados = filtrarDados();
    tbody.innerHTML = '';

    dadosFiltrados.forEach(r => {
      const tr = document.createElement('tr');

      camposFiltraveis.forEach(campo => {
        const td = document.createElement('td');
        td.textContent = r[campo] ?? '';
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
  }

  // ----------------------------
  // Carregar registros do banco
  // ----------------------------
  async function carregarRegistros() {
    try {
      const res = await fetch('/api/registros', { credentials: 'include' });
      const dados = await res.json();
      if (!Array.isArray(dados)) return;
      todosRegistros = dados;
      renderizarTabela();
    } catch (e) {
      console.error(e);
      alert('❌ Erro ao carregar registros.');
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
    const AutorInput  = document.getElementById('Autor');
    const Autor       = AutorInput ? AutorInput.value.trim() : '';

    if (!Projeto || !TipoProjeto || !TipoObra || !Disciplina || !TipoDoc || !Sequencia || !Revisao || !Autor) {
      alert('⚠️ Por favor, preencha todos os campos antes de salvar.');
      return;
    }

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

      if (!res.ok) {
        let errorMsg = '❌ Erro ao salvar.';
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) errorMsg = `❌ ${errorData.error}`;
        } catch {}
        alert(errorMsg);
        return;
      }

      alert('✅ Registro salvo com sucesso!');
      await carregarRegistros();
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao enviar dados. Verifique sua conexão.');
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
        let errorMsg = '❌ Erro ao excluir registro.';
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) errorMsg = `❌ ${errorData.error}`;
        } catch {}
        alert(errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao excluir registro. Verifique sua conexão.');
    }
  }

  // ----------------------------
  // Inicialização
  // ----------------------------
  carregarRegistros();
});
