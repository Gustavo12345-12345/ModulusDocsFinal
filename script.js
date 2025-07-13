// script.js - VERSÃO CORRIGIDA E SIMPLIFICADA

document.addEventListener('DOMContentLoaded', () => {
  const tabelaRegistros = document.getElementById('tabela').getElementsByTagName('tbody')[0]; //
  const logoutBtn = document.getElementById('logoutBtn');
  const exportarCSV = document.getElementById('btnExportarCSV'); //
  const gerarBtn = document.getElementById('btnGerar'); //

  const carregarRegistros = async () => {
    const response = await fetch('/registros');
    const dados = await response.json();
    tabelaRegistros.innerHTML = '';
    dados.forEach(registro => {
      const row = tabelaRegistros.insertRow();
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
      `;
    });
  };

  if(logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/logout');
      window.location.href = '/login.html'; //
    });
  }

  if (exportarCSV) {
    exportarCSV.addEventListener('click', () => {
      const csv = [];
      const linhas = document.querySelectorAll('#tabela tr');
      linhas.forEach(linha => {
        const row = [];
        linha.querySelectorAll('th, td').forEach((celula, index) => {
          if (index < linha.cells.length - 1) {
            row.push(`"${celula.innerText}"`);
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
    });
  }
  
  // LÓGICA DE GERAR E SALVAR UNIFICADA
  if (gerarBtn) {
    gerarBtn.addEventListener('click', async () => {
      // --- 1. GERAÇÃO DO CÓDIGO ---
      const projeto = document.getElementById('CodigoProjeto').value; //
      const tipoObra = document.getElementById('TipoObra').value; //
      const tipoProjeto = document.getElementById('TipoProjeto').value; //
      const tipoDoc = document.getElementById('TipoDoc').value; //
      const disciplina = document.getElementById('Disciplina').value; //
      const sequencia = document.getElementById('Sequencia').value; //
      const revisao = document.getElementById('Revisao').value; //
      
      if (!sequencia || !revisao) {
          alert('Por favor, preencha os campos Sequência e Revisão.');
          return;
      }
      
      const sequenciaFormatada = sequencia.padStart(3, '0');
      const revisaoFormatada = revisao.toUpperCase();
      const codigoGerado = `${projeto}-${tipoObra}-${tipoProjeto}-${tipoDoc}-${disciplina}-${sequenciaFormatada}-${revisaoFormatada}`;

      // --- 2. PREPARAÇÃO DOS DADOS PARA SALVAR ---
      const dadosParaSalvar = {
        projeto: projeto,
        tipo_obra: tipoObra,
        tipo_projeto: tipoProjeto,
        tipo_doc: tipoDoc,
        disciplina: disciplina,
        sequencia: sequenciaFormatada,
        revisao: revisaoFormatada,
        codigo_arquivo: codigoGerado,
        data: new Date().toISOString().split('T')[0],
      };

      // --- 3. ENVIO DOS DADOS PARA O SERVIDOR (SALVAR) ---
      await fetch('/registro', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dadosParaSalvar),
      }); //

      // --- 4. LIMPEZA E ATUALIZAÇÃO ---
      document.getElementById('Sequencia').value = '';
      document.getElementById('Revisao').value = '';
      
      alert(`Registro salvo com o código: ${codigoGerado}`);
      carregarRegistros(); // Atualiza a tabela com o novo registro
    });
  }

  carregarRegistros();
});

async function deletarRegistro(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) {
    return;
  }
  await fetch(`/registro/${id}`, { method: 'DELETE' }); //
  location.reload();
}
