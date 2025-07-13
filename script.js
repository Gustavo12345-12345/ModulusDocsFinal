
document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registroForm');
  const tabelaRegistros = document.getElementById('tabelaRegistros').getElementsByTagName('tbody')[0];
  const logoutBtn = document.getElementById('logoutBtn');
  const exportarCSV = document.getElementById('exportarCSV');
  const gerarBtn = document.getElementById('btnGerar');

  const carregarRegistros = async () => {
    const response = await fetch('/registros');
    const dados = await response.json();

    tabelaRegistros.innerHTML = '';

    dados.forEach(registro => {
      const row = tabelaRegistros.insertRow();

      row.innerHTML = `
        <td>${registro.projeto}</td>
        <td>${registro.tipo_obra}</td>
        <td>${registro.tipo_projeto}</td>
        <td>${registro.tipo_doc}</td>
        <td>${registro.disciplina}</td>
        <td>${registro.sequencia}</td>
        <td>${registro.revisao}</td>
        <td>${registro.codigo_arquivo}</td>
        <td>${new Date(registro.data).toLocaleDateString()}</td>
        <td>${registro.autor}</td>
        <td><button onclick="deletarRegistro(${registro.id})">Excluir</button></td>
      `;
    });
  };

  registroForm.addEventListener('submit', async e => {
    e.preventDefault();

    const dados = {
      projeto: registroForm.Projeto.value,
      tipo_obra: registroForm.TipoObra.value,
      tipo_projeto: registroForm.TipoProjeto.value,
      tipo_doc: registroForm.TipoDoc.value,
      disciplina: registroForm.Disciplina.value,
      sequencia: registroForm.Sequencia.value,
      revisao: registroForm.Revisao.value,
      codigo_arquivo: registroForm.CodigoArquivo.value,
      data: registroForm.Data.value,
    };

    await fetch('/registro', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(dados),
    });

    registroForm.reset();
    carregarRegistros();
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/logout');
    window.location.href = '/login';
  });

  exportarCSV.addEventListener('click', () => {
    const csv = [];
    const linhas = document.querySelectorAll('table tr');
    linhas.forEach(linha => {
      const row = [];
      linha.querySelectorAll('th, td').forEach(celula => {
        row.push(celula.innerText);
      });
      csv.push(row.join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registros.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  });

  gerarBtn.addEventListener('click', () => {
    const projeto = registroForm.Projeto.value;
    const tipoObra = registroForm.TipoObra.value;
    const tipoProjeto = registroForm.TipoProjeto.value;
    const tipoDoc = registroForm.TipoDoc.value;
    const disciplina = registroForm.Disciplina.value;
    const sequencia = registroForm.Sequencia.value.padStart(3, '0');
    const revisao = registroForm.Revisao.value.toUpperCase();

    const codigo = `${projeto}-${tipoObra}-${tipoProjeto}-${tipoDoc}-${disciplina}-${sequencia}-${revisao}`;
    registroForm.CodigoArquivo.value = codigo;
  });

  carregarRegistros();
});

async function deletarRegistro(id) {
  await fetch(`/registro/${id}`, { method: 'DELETE' });
  location.reload();
}
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
