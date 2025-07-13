// script.js - VERSÃO CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registroForm'); // Assumindo que seu form tem este ID
  const tabelaRegistros = document.getElementById('tabela').getElementsByTagName('tbody')[0]; // Ajustado para o ID 'tabela'
  const logoutBtn = document.getElementById('logoutBtn'); // Assumindo que existe um botão de logout
  const exportarCSV = document.getElementById('btnExportarCSV'); //
  const gerarBtn = document.getElementById('btnGerar'); //

  const carregarRegistros = async () => {
    // A URL '/registros' agora vai funcionar com o server.js corrigido
    const response = await fetch('/registros'); //
    const dados = await response.json(); //

    tabelaRegistros.innerHTML = '';

    dados.forEach(registro => {
      const row = tabelaRegistros.insertRow();

      // CORREÇÃO: Usando os nomes das colunas em minúsculas, como estão no banco de dados.
      // Ex: de 'registro.projeto' para 'registro.projeto' (já estava certo, mas confirmando)
      // Ex: de 'registro.tipo_obra' para 'registro.tipoobra', etc.
      // NOTE: O banco de dados no Node-PG retorna nomes de colunas em minúsculas por padrão.
      row.innerHTML = `
        <td>${registro.projeto}</td>
        <td>${registro.tipoobra}</td>
        <td>${registro.tipoprojeto}</td>
        <td>${registro.tipodoc}</td>
        <td>${registro.disciplina}</td>
        <td>${registro.sequencia}</td>
        <td>${registro.revisao}</td>
        <td>${registro.codigoarquivo}</td>
        <td>${new Date(registro.data).toLocaleDateString()}</td>
        <td>${registro.autor}</td>
        <td><button onclick="deletarRegistro(${registro.id})">Excluir</button></td>
      `; //
    });
  };

  // Verifique se o formulário existe antes de adicionar o listener
  if (registroForm) {
      registroForm.addEventListener('submit', async e => {
        e.preventDefault();

        const dados = {
          // Os nomes aqui (ex: 'projeto') devem bater com o que o backend espera no 'req.body'
          projeto: document.getElementById('CodigoProjeto').value, // Ajustado para pegar do select correto
          tipo_obra: document.getElementById('TipoObra').value, //
          tipo_projeto: document.getElementById('TipoProjeto').value, //
          tipo_doc: document.getElementById('TipoDoc').value, //
          disciplina: document.getElementById('Disciplina').value, //
          sequencia: document.getElementById('Sequencia').value, //
          revisao: document.getElementById('Revisao').value, //
          // O 'codigo_arquivo' é gerado e já está no campo, não precisa montar de novo aqui
          codigo_arquivo: document.getElementById('CodigoArquivo').value, // Assumindo que existe um campo com este ID
          data: new Date().toISOString().split('T')[0], // Gera a data atual
        };

        // A URL '/registro' agora funciona com o server.js corrigido
        await fetch('/registro', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(dados),
        }); //

        if(document.getElementById('CodigoArquivo')) document.getElementById('CodigoArquivo').value = ''; // Limpa o campo do código
        // registroForm.reset(); // O reset pode não ser ideal se você quiser manter os selects
        carregarRegistros();
      });
  }


  if(logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('/logout'); //
        window.location.href = '/login.html'; //
      });
  }


  exportarCSV.addEventListener('click', () => {
    const csv = [];
    const linhas = document.querySelectorAll('#tabela tr'); // Corrigido para pegar da tabela certa
    linhas.forEach(linha => {
      const row = [];
      // Ajustado para não incluir a coluna 'Ações'
      linha.querySelectorAll('th, td').forEach((celula, index) => {
          if (index < linha.cells.length - 1) { // Ignora a última célula (Ações)
            row.push(celula.innerText);
          }
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
  }); //

  gerarBtn.addEventListener('click', () => {
    // CORREÇÃO: Pegando os valores dos IDs corretos do index.html
    const projeto = document.getElementById('CodigoProjeto').value; //
    const tipoObra = document.getElementById('TipoObra').value; //
    const tipoProjeto = document.getElementById('TipoProjeto').value; //
    const tipoDoc = document.getElementById('TipoDoc').value; //
    const disciplina = document.getElementById('Disciplina').value; //
    const sequencia = document.getElementById('Sequencia').value.padStart(3, '0'); //
    const revisao = document.getElementById('Revisao').value.toUpperCase(); //

    const codigo = `${projeto}-${tipoObra}-${tipoProjeto}-${tipoDoc}-${disciplina}-${sequencia}-${revisao}`;

    // É preciso um campo no HTML para receber o código gerado.
    // Assumindo que você tem um <input type="text" id="CodigoArquivo">
    // Vou adicionar este campo mentalmente ao seu form
    if(document.getElementById('CodigoArquivo')) {
        document.getElementById('CodigoArquivo').value = codigo;
    } else {
        // Se o campo não existir, criaremos um input invisível para submeter
        let hiddenInput = document.getElementById('CodigoArquivo');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'CodigoArquivo';
            // Assumindo que seu formulário principal tem o id 'registroForm'
            document.querySelector('.form-group').appendChild(hiddenInput);
        }
        hiddenInput.value = codigo;
        // Para debug, mostra o código gerado
        alert('Código gerado (e armazenado em um campo oculto): ' + codigo);
    }
  });

  carregarRegistros();
});

async function deletarRegistro(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) {
    return;
  }
  // A URL e o método agora correspondem ao backend corrigido
  await fetch(`/registro/${id}`, { method: 'DELETE' }); //
  location.reload();
}
