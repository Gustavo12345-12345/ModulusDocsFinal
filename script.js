// script.js - VERSÃO COM LIMPEZA FORÇADA DE TODOS OS CAMPOS (INCLUINDO COMBOS)

/**
 * Função dedicada para limpar todos os campos de formulário e filtros.
 * Isso garante que a página sempre comece em um estado limpo.
 */
function limparTodosOsCampos() {
  // Limpa os campos de input de texto do formulário principal
  const inputsDoFormulario = document.querySelectorAll('.form-group input[type="text"]');
  inputsDoFormulario.forEach(input => {
    input.value = '';
  });

  // Reseta os campos de seleção (dropdowns/combos) para a primeira opção
  const selectsDoFormulario = document.querySelectorAll('.form-group select');
  selectsDoFormulario.forEach(select => {
    select.selectedIndex = 0;
  });

  // Limpa também os campos de filtro da tabela
  const inputsDeFiltro = document.querySelectorAll('.filtros input[type="text"]');
  inputsDeFiltro.forEach(input => {
    input.value = '';
  });
}


// O código principal da aplicação continua aqui.
document.addEventListener('DOMContentLoaded', () => {
  // --- VARIÁVEIS GLOBAIS ---
  let todosOsRegistros = [];

  // --- SELETORES DE ELEMENTOS ---
  const tabelaRegistros = document.getElementById('tabela').getElementsByTagName('tbody')[0];
  const logoutBtn = document.getElementById('logoutBtn');
  const exportarCSVBtn = document.getElementById('btnExportarCSV');
  const gerarBtn = document.getElementById('btnGerar');
  const filtrosDeColunaInputs = document.querySelectorAll('.filtros input');

  // --- FUNÇÕES ---

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

  const carregarRegistros = async () => {
    try {
      const response = await fetch('/registros');
      todosOsRegistros = await response.json();
      renderizarTabela(todosOsRegistros);
    } catch (error) {
      console.error("Falha ao carregar registros:", error);
      tabelaRegistros.innerHTML = `<tr><td colspan="11">Erro ao carregar dados.</td></tr>`;
    }
  };

  // --- EVENT LISTENERS ---

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
        alert("Não há dados para exportar.");
        return;
      }
      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registros.csv';
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

  filtrosDeColunaInputs.forEach(input => input.addEventListener('input', aplicarFiltros));

  // --- CHAMADA INICIAL ---
  carregarRegistros();
});


/**
 * Executa a limpeza DEPOIS que toda a página foi carregada.
 * Esta é a abordagem mais robusta contra o autocompletar do navegador.
 */
window.onload = function() {
    limparTodosOsCampos();
};


async function deletarRegistro(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) {
    return;
  }
  await fetch(`/registro/${id}`, { method: 'DELETE' });
  location.reload();
}
