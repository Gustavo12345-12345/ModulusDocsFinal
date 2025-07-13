// script.js - VERSÃO CORRIGIDA (sem referências aos elementos removidos)

document.addEventListener('DOMContentLoaded', () => {
  // --- VARIÁVEIS GLOBAIS ---
  let todosOsRegistros = []; 

  // --- SELETORES DE ELEMENTOS ---
  const tabelaRegistros = document.getElementById('tabela').getElementsByTagName('tbody')[0];
  const logoutBtn = document.getElementById('logoutBtn');
  const exportarCSVBtn = document.getElementById('btnExportarCSV');
  const gerarBtn = document.getElementById('btnGerar');
  const filtrosDeColunaInputs = document.querySelectorAll('.filtros input');
  // Limpa os campos de input ao carregar a página (simulando login)
  const inputCampos = document.querySelectorAll('.form-group input');
  inputCampos.forEach(input => {
    input.value = '';
  });

  // Se você também quiser limpar os campos de select (dropdowns), pode usar este código:
  const selectCampos = document.querySelectorAll('.form-group select');
  selectCampos.forEach(select => {
    select.selectedIndex = 0; // Define a primeira opção como selecionada
  });
  // --- FUNÇÕES ---

  /**
   * Função responsável por desenhar as linhas da tabela na tela.
   * @param {Array} registros - Um array de objetos de registro para exibir.
   */
  const renderizarTabela = (registros) => {
    tabelaRegistros.innerHTML = ''; 
    registros.forEach(registro => {
      const row = tabelaRegistros.insertRow();
      const dataFormatada = registro.data ? new Date(registro.data).toLocaleDateString() : '';
      
      row.innerHTML = `
        <td>${registro.projeto}</td>
        <td>${registro.tipoobra}</td>
        <td>${registro.tipoprojeto}</td>
        <td>${registro.tipodoc}</td>
        <td>${registro.disciplina}</td>
        <td>${registro.sequencia}</td>
        <td>${registro.revisao}</td>
        <td>${registro.codigoarquivo}</td>
        <td>${dataFormatada}</td>
        <td>${registro.autor}</td>
        <td><button onclick="deletarRegistro(${registro.id})">Excluir</button></td>
      `;
    });
  };

  /**
   * Função que aplica os filtros de cada coluna.
   * A lógica do filtro geral foi removida, pois o campo não existe mais.
   */
  const aplicarFiltros = () => {
    const valoresFiltrosColuna = Array.from(filtrosDeColunaInputs).map(input => input.value.toLowerCase());
    const mapaColunas = ['projeto', 'tipoobra', 'tipoprojeto', 'tipodoc', 'disciplina', 'sequencia', 'revisao', 'codigoarquivo', 'data', 'autor'];

    const registrosFiltrados = todosOsRegistros.filter(registro => {
      return valoresFiltrosColuna.every((filtro, index) => {
        if (!filtro) return true;
        const nomeDaColuna = mapaColunas[index];
        const valorDaColuna = String(registro[nomeDaColuna]).toLowerCase();
        return valorDaColuna.includes(filtro);
      });
    });

    renderizarTabela(registrosFiltrados);
  };

  /**
   * Carrega os dados iniciais do servidor.
   */
  const carregarRegistros = async () => {
    try {
      const response = await fetch('/registros');
      todosOsRegistros = await response.json();
      renderizarTabela(todosOsRegistros);
    } catch (error) {
      console.error("Falha ao carregar registros:", error);
      tabelaRegistros.innerHTML = `<tr><td colspan="11">Erro ao carregar dados. Verifique a conexão com o servidor.</td></tr>`;
    }
  };

  // --- EVENT LISTENERS (Ouvintes de eventos) ---

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/logout');
      window.location.href = '/login.html';
    });
  }
  
  if (exportarCSVBtn) {
    exportarCSVBtn.addEventListener('click', () => {
      const csv = [];
      const cabecalho = Array.from(document.querySelectorAll('#tabela thead th')).map(th => th.innerText.trim()).slice(0, -1);
      csv.push(cabecalho.join(','));

      const linhasDeDados = document.querySelectorAll('#tabela tbody tr');
       linhasDeDados.forEach(linha => {
        const row = [];
        linha.querySelectorAll('td').forEach((celula, index) => {
          if (index < linha.cells.length - 1) {
            row.push(`"${celula.innerText}"`);
          }
        });
        csv.push(row.join(','));
      });

      if (linhasDeDados.length === 0) {
        alert("Não há dados filtrados para exportar.");
        return;
      }

      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registros_filtrados.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  
  if (gerarBtn) {
    gerarBtn.addEventListener('click', async () => {
      const projeto = document.getElementById('CodigoProjeto').value;
      const tipoObra = document.getElementById('TipoObra').value;
      const tipoProjeto = document.getElementById('TipoProjeto').value;
      const tipoDoc = document.getElementById('TipoDoc').value;
      const disciplina = document.getElementById('Disciplina').value;
      const sequencia = document.getElementById('Sequencia').value;
      const revisao = document.getElementById('Revisao').value;
      
      if (!sequencia || !revisao) {
          alert('Por favor, preencha os campos Sequência e Revisão.');
          return;
      }
      
      const sequenciaFormatada = sequencia.padStart(3, '0');
      const revisaoFormatada = revisao.toUpperCase();
      const codigoGerado = `${projeto}-${tipoObra}-${tipoProjeto}-${tipoDoc}-${disciplina}-${sequenciaFormatada}-${revisaoFormatada}`;
      
      const dadosParaSalvar = {
        projeto, tipo_obra: tipoObra, tipo_projeto: tipoProjeto, tipo_doc: tipoDoc, disciplina, 
        sequencia: sequenciaFormatada, revisao: revisaoFormatada, codigo_arquivo: codigoGerado,
        data: new Date().toISOString().split('T')[0],
      };

      await fetch('/registro', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(dadosParaSalvar) });
      
      document.getElementById('Sequencia').value = '';
      document.getElementById('Revisao').value = '';
      
      alert(`Registro salvo com o código: ${codigoGerado}`);
      carregarRegistros();
    });
  }

  // Adiciona os listeners APENAS para os filtros de coluna, que ainda existem.
  filtrosDeColunaInputs.forEach(input => input.addEventListener('input', aplicarFiltros));

  // --- CHAMADA INICIAL ---
  carregarRegistros();
});

async function deletarRegistro(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) {
    return;
  }
  await fetch(`/registro/${id}`, { method: 'DELETE' });
  // Recarrega os dados do servidor e atualiza a tabela
  location.reload(); // Recarregar a página é a forma mais simples de atualizar tudo.
}
