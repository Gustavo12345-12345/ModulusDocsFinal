document.addEventListener('DOMContentLoaded', () => {
  const filtroGeralInput = document.getElementById('filtroGeral');
  const btnExportarCSV = document.getElementById('btnExportarCSV');
  const btnGerar = document.getElementById('btnGerar');
  const tbody = document.querySelector('tbody');
  let todosRegistros = [];

  async function carregarRegistros() {
    const res = await fetch('/api/registros');
    todosRegistros = await res.json();
    renderTabela(todosRegistros);
  }

  function renderTabela(data) {
    tbody.innerHTML = '';
    data.forEach(item => {
      const tr = document.createElement('tr');
      Object.values(item).forEach(v => {
        const td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function filtrarGlobal() {
    const termo = filtroGeralInput.value.trim().toLowerCase();
    const filtrados = todosRegistros.filter(row =>
      Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(termo)
      )
    );
    renderTabela(filtrados);
  }

  filtroGeralInput.addEventListener('input', filtrarGlobal);

  btnExportarCSV.addEventListener('click', () => {
    const termo = filtroGeralInput.value.trim().toLowerCase();
    const filtrados = todosRegistros.filter(row =>
      Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(termo)
      )
    );

    if (!filtrados.length) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const csv = [Object.keys(filtrados[0]).join(',')]
      .concat(filtrados.map(r => Object.values(r).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'registros_filtrados.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  btnGerar.addEventListener('click', function () {
    const projeto = document.getElementById('CodigoProjeto').value;
    const tipoProjeto = document.getElementById('TipoProjeto').value;
    const tipoObra = document.getElementById('TipoObra').value;
    const disciplina = document.getElementById('Disciplina').value;
    const tipoDoc = document.getElementById('TipoDoc').value;
    const sequencia = document.getElementById('Sequencia').value.padStart(3, '0');
    const revisao = document.getElementById('Revisao').value.toUpperCase().padStart(2, '0');

    if (!projeto || !tipoProjeto || !tipoObra || !disciplina || !tipoDoc || !sequencia || !revisao) {
      alert("Preencha todos os campos obrigatórios para gerar o código.");
      return;
    }

    const codigo = `${projeto}-${tipoProjeto}-${tipoObra}-${disciplina}-${tipoDoc}-${sequencia}-${revisao}`;
    const inputCodigo = document.getElementById('CodigoArquivo');
    if (inputCodigo) inputCodigo.value = codigo;
  });

  // Filtros por coluna
  document.querySelectorAll(".filtros input").forEach((input, index) => {
    input.addEventListener("input", () => {
      const filtro = input.value.toLowerCase();
      const linhas = document.querySelectorAll("#tabela tbody tr");
      linhas.forEach((linha) => {
        const celula = linha.cells[index];
        const conteudo = celula ? celula.textContent.toLowerCase() : "";
        const visivel = conteudo.includes(filtro);
        linha.style.display = visivel ? "" : "none";
      });
    });
  });

  // Exportar visíveis para XLSX
  document.getElementById("btnExportarFiltro").addEventListener("click", function () {
    const XLSX = window.XLSX;
    const tabela = document.getElementById("tabela");
    const linhasVisiveis = Array.from(tabela.querySelectorAll("tbody tr")).filter(
      (linha) => linha.style.display !== "none"
    );

    const dados = [];
    const cabecalho = Array.from(tabela.querySelectorAll("thead tr")[0].cells).map((th) => th.textContent.trim());
    dados.push(cabecalho.slice(0, -1)); // Remove "Ações"

    linhasVisiveis.forEach((linha) => {
      const linhaDados = Array.from(linha.cells).map((td) => td.textContent.trim());
      dados.push(linhaDados.slice(0, -1)); // Remove "Ações"
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtrados");
    XLSX.writeFile(wb, "download.xlsx");
  });

  carregarRegistros();
});
