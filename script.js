// script.js completamente reescrito para funcionar com Supabase e novo HTML

document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://xxxxx.supabase.co"; // Substitua pelo seu
  const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY"; // Substitua pelo seu
  const TABELA = "documentos";

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };

  const elementos = {
    projeto: document.getElementById("CodigoProjeto"),
    tipoProjeto: document.getElementById("TipoProjeto"),
    tipoObra: document.getElementById("TipoObra"),
    disciplina: document.getElementById("Disciplina"),
    tipoDoc: document.getElementById("TipoDoc"),
    sequencia: document.getElementById("Sequencia"),
    revisao: document.getElementById("Revisao"),
    codigoArquivo: document.getElementById("CodigoArquivo"),
    data: document.getElementById("Data"),
  };

  document.getElementById("btnGerar").addEventListener("click", () => {
    const { projeto, tipoProjeto, tipoObra, disciplina, tipoDoc, sequencia, revisao } = elementos;
    if (projeto.value && tipoProjeto.value && tipoObra.value && disciplina.value && tipoDoc.value && sequencia.value && revisao.value) {
      const codigo = `${projeto.value}-${tipoProjeto.value}-${tipoObra.value}-${disciplina.value}-${tipoDoc.value}-${sequencia.value}-${revisao.value}`;
      elementos.codigoArquivo.value = codigo;
    } else {
      alert("Preencha todos os campos para gerar o código.");
    }
  });

  document.getElementById("btnSalvar").addEventListener("click", async () => {
    const registro = {
      projeto: elementos.projeto.value,
      tipo_projeto: elementos.tipoProjeto.value,
      tipo_obra: elementos.tipoObra.value,
      disciplina: elementos.disciplina.value,
      tipo_doc: elementos.tipoDoc.value,
      sequencia: elementos.sequencia.value,
      revisao: elementos.revisao.value,
      codigo_arquivo: elementos.codigoArquivo.value,
      data: elementos.data.value,
      autor: "Sistema"
    };

    if (!registro.codigo_arquivo) {
      alert("Clique em 'Gerar Código' antes de salvar.");
      return;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
      method: "POST",
      headers,
      body: JSON.stringify(registro)
    });

    if (res.ok) {
      alert("Registro salvo com sucesso.");
      carregarTabela();
    } else {
      alert("Erro ao salvar registro.");
    }
  });

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.querySelectorAll(".filtros input").forEach(input => input.value = "");
    carregarTabela();
  });

  document.getElementById("btnExportarFiltro").addEventListener("click", () => {
    const linhas = Array.from(document.querySelectorAll("#tabela tbody tr"));
    const csv = linhas.map(tr => Array.from(tr.children).slice(0, 10).map(td => td.innerText).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registros.csv";
    link.click();
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    window.location.href = "/logout";
  });

  async function carregarTabela() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?select=*`, {
      headers
    });
    const dados = await res.json();
    const tbody = document.querySelector("#tabela tbody");
    tbody.innerHTML = "";
    dados.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.projeto}</td>
        <td>${item.tipo_obra}</td>
        <td>${item.tipo_projeto}</td>
        <td>${item.tipo_doc}</td>
        <td>${item.disciplina}</td>
        <td>${item.sequencia}</td>
        <td>${item.revisao}</td>
        <td>${item.codigo_arquivo}</td>
        <td>${item.data}</td>
        <td>${item.autor}</td>
        <td><button onclick="deletarRegistro(${item.id})">🗑</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.deletarRegistro = async (id) => {
    if (confirm("Deseja excluir este registro?")) {
      await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?id=eq.${id}`, {
        method: "DELETE",
        headers
      });
      carregarTabela();
    }
  };

  carregarTabela();
});
