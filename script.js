const tableBody = document.querySelector("#tabelaRegistros tbody");
const form = document.getElementById("registroForm");
const btnExportar = document.getElementById("exportarCSV");
const btnLogout = document.getElementById("logoutBtn");

let socket;
try {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const socket = new WebSocket(`${protocol}${window.location.host}`);

  socket.onmessage = () => carregarRegistros();
} catch (e) {
  console.error("WebSocket error:", e);
}

async function carregarRegistros() {
  try {
    const res = await fetch("/api/registros", { credentials: "include" });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Formato de dados inválido");

    tableBody.innerHTML = "";
    data.forEach((reg) => {
      const tr = document.createElement("tr");

      [
        reg.Projeto, reg.TipoObra, reg.TipoProjeto, reg.TipoDoc,
        reg.Disciplina, reg.Sequencia, reg.Revisao,
        reg.CodigoArquivo, reg.Data?.split("T")[0], reg.Autor
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
      });

      const tdAcoes = document.createElement("td");

      const btnEditarSeq = document.createElement("button");
      btnEditarSeq.textContent = "↑ Seq";
      btnEditarSeq.onclick = () => atualizarCampo(reg.CodigoArquivo, "Sequencia", Number(reg.Sequencia) + 1);

      const btnEditarRev = document.createElement("button");
      btnEditarRev.textContent = "↑ Rev";
      btnEditarRev.onclick = () => atualizarCampo(reg.CodigoArquivo, "Revisao", Number(reg.Revisao) + 1);

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "🗑";
      btnExcluir.onclick = () => deletarRegistro(reg.CodigoArquivo);

      tdAcoes.append(btnEditarSeq, btnEditarRev, btnExcluir);
      tr.appendChild(tdAcoes);

      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar registros:", err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    Projeto: form.Projeto.value.trim(),
    TipoObra: form.TipoObra.value.trim(),
    TipoProjeto: form.TipoProjeto.value.trim(),
    TipoDoc: form.TipoDoc.value.trim(),
    Disciplina: form.Disciplina.value.trim(),
    Sequencia: form.Sequencia.value.trim(),
    Revisao: form.Revisao.value.trim(),
    CodigoArquivo: form.CodigoArquivo.value.trim(),
    Data: form.Data.value
  };

  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dados)
    });

    if (res.ok) {
      form.reset();
      carregarRegistros();
    } else {
      alert("Erro ao salvar registro.");
    }
  } catch (err) {
    console.error("Erro ao enviar dados:", err);
  }
});

async function atualizarCampo(codigo, campo, valor) {
  try {
    const res = await fetch(`/api/data/${codigo}/campo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ campo, valor })
    });

    if (res.ok) carregarRegistros();
    else alert("Erro ao atualizar.");
  } catch (err) {
    console.error(err);
  }
}

async function deletarRegistro(codigo) {
  if (!confirm("Deseja excluir este registro?")) return;
  try {
    const res = await fetch(`/api/data/${codigo}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) carregarRegistros();
    else alert("Erro ao excluir.");
  } catch (err) {
    console.error(err);
  }
}

btnExportar.addEventListener("click", () => {
  window.location.href = "/api/exportar-csv";
});

btnLogout.addEventListener("click", () => {
  window.location.href = "/logout";
});

carregarRegistros();
