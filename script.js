document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");
  const tabela = document.getElementById("tabelaRegistros").querySelector("tbody");
  const exportarBtn = document.getElementById("exportarCSV");
  const logoutBtn = document.getElementById("logoutBtn");

  // Função para carregar os registros do banco
  async function carregarRegistros() {
    const response = await fetch("/registros");
    const registros = await response.json();
    tabela.innerHTML = "";
    registros.forEach(reg => adicionarLinhaNaTabela(reg));
  }

  // Função para adicionar uma linha na tabela
  function adicionarLinhaNaTabela(reg) {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${reg.Projeto}</td>
      <td>${reg.TipoObra}</td>
      <td>${reg.TipoProjeto}</td>
      <td>${reg.TipoDoc}</td>
      <td>${reg.Disciplina}</td>
      <td>${reg.Sequencia}</td>
      <td>${reg.Revisao}</td>
      <td>${reg.CodigoArquivo}</td>
      <td>${new Date(reg.Data).toLocaleDateString()}</td>
      <td>${reg.Autor}</td>
      <td><button class="btn-excluir" data-id="${reg.id}">Excluir</button></td>
    `;
    tabela.appendChild(linha);
  }

  // Envio do formulário
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      const novoRegistro = await response.json();
      adicionarLinhaNaTabela(novoRegistro);
      form.reset();
    } else {
      alert("Erro ao salvar o registro.");
    }
  });

  // Excluir registro
  tabela.addEventListener("click", async function (e) {
    if (e.target.classList.contains("btn-excluir")) {
      const id = e.target.dataset.id;
      const response = await fetch(`/registro/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        e.target.closest("tr").remove();
      }
    }
  });

  // Exportar CSV
  exportarBtn.addEventListener("click", function () {
    const linhas = Array.from(tabela.querySelectorAll("tr"));
    let csv = "Projeto,TipoObra,TipoProjeto,TipoDoc,Disciplina,Sequencia,Revisao,CodigoArquivo,Data,Autor\n";
    linhas.forEach(linha => {
      const colunas = linha.querySelectorAll("td");
      if (colunas.length > 0) {
        const dados = Array.from(colunas).slice(0, 10).map(td => `"${td.innerText}"`).join(",");
        csv += dados + "\n";
      }
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registros.csv";
    link.click();
  });

  // Logout
  logoutBtn.addEventListener("click", function () {
    window.location.href = "/logout";
  });

  // Carregar dados ao iniciar
  carregarRegistros();
});
