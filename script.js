
document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabela-registros");
  const form = document.getElementById("form-registro");
  const campos = ["Projeto", "TipoObra", "TipoProjeto", "TipoDoc", "Disciplina", "Sequencia", "Revisao", "CodigoArquivo", "Data"];

  function carregarRegistros() {
    fetch("/api/registros")
      .then(res => res.json())
      .then(data => {
        tabela.innerHTML = "";
        data.forEach(reg => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${reg.Projeto}</td>
            <td>${reg.TipoObra}</td>
            <td>${reg.TipoProjeto}</td>
            <td>${reg.TipoDoc}</td>
            <td>${reg.Disciplina}</td>
            <td>${reg.Sequencia}</td>
            <td>${reg.Revisao}</td>
            <td>${reg.CodigoArquivo}</td>
            <td>${new Date(reg.Data).toLocaleDateString('pt-BR')}</td>
            <td>${reg.Autor}</td>
            <td>
              <button onclick="editar('${reg.CodigoArquivo}')">Editar</button>
              <button onclick="remover('${reg.CodigoArquivo}')">Remover</button>
            </td>
          `;
          tabela.appendChild(tr);
        });
      });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = {};
    campos.forEach(c => data[c] = form[c].value);
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
      if (res.ok) form.reset();
      carregarRegistros();
    });
  });

  window.remover = (codigo) => {
    fetch("/api/data/" + codigo, { method: "DELETE" })
      .then(res => {
        if (res.ok) carregarRegistros();
      });
  };

  window.editar = (codigo) => {
    const linha = [...tabela.querySelectorAll("tr")].find(tr => tr.children[7]?.innerText === codigo);
    if (!linha) return;

    campos.forEach((c, i) => {
      form[c].value = linha.children[i]?.innerText || "";
    });
  };

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  let socket;
  try {
    socket = new WebSocket(`${protocol}://${location.host}`);
    socket.onmessage = () => carregarRegistros();
  } catch (e) {
    console.error("WebSocket error:", e);
  }

  carregarRegistros();
});
